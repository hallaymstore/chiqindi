const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const { readCollection, writeCollection, clone } = require('./jsonStore');

const patchedModels = new Set();

const isObjectIdLike = (value) =>
  value &&
  typeof value === 'object' &&
  (value._bsontype === 'ObjectId' || value.constructor?.name === 'ObjectId');

const normalizeValue = (value) => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (isObjectIdLike(value)) {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((result, [key, nestedValue]) => {
      result[key] = normalizeValue(nestedValue);
      return result;
    }, {});
  }

  return value;
};

const getByPath = (source, path) =>
  path.split('.').reduce((value, segment) => {
    if (value == null) {
      return undefined;
    }

    return value[segment];
  }, source);

const setByPath = (target, path, value) => {
  const segments = path.split('.');
  let cursor = target;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    if (!cursor[segment] || typeof cursor[segment] !== 'object') {
      cursor[segment] = {};
    }
    cursor = cursor[segment];
  }

  cursor[segments[segments.length - 1]] = value;
};

const compareValues = (left, right) => {
  if (left == null || right == null) {
    return left == right;
  }

  const normalizedLeft = normalizeValue(left);
  const normalizedRight = normalizeValue(right);
  return String(normalizedLeft) === String(normalizedRight);
};

const matchesCondition = (document, key, condition) => {
  const value = getByPath(document, key);

  if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
    if ('$in' in condition) {
      return condition.$in.some((candidate) => compareValues(value, candidate));
    }

    if ('$ne' in condition) {
      return !compareValues(value, condition.$ne);
    }

    if ('$regex' in condition) {
      const regularExpression = new RegExp(condition.$regex, condition.$options || '');
      return regularExpression.test(String(value || ''));
    }
  }

  return compareValues(value, condition);
};

const matchesFilter = (document, filter = {}) => {
  if (!filter || !Object.keys(filter).length) {
    return true;
  }

  return Object.entries(filter).every(([key, condition]) => {
    if (key === '$or') {
      return condition.some((subFilter) => matchesFilter(document, subFilter));
    }

    return matchesCondition(document, key, condition);
  });
};

const sortRecords = (records, sortSpecification = {}) => {
  const entries = Object.entries(sortSpecification);
  if (!entries.length) {
    return records;
  }

  return records.sort((left, right) => {
    for (const [field, direction] of entries) {
      const leftValue = getByPath(left, field);
      const rightValue = getByPath(right, field);

      if (leftValue === rightValue) {
        continue;
      }

      if (leftValue == null) {
        return 1;
      }

      if (rightValue == null) {
        return -1;
      }

      if (leftValue > rightValue) {
        return direction >= 0 ? 1 : -1;
      }

      if (leftValue < rightValue) {
        return direction >= 0 ? -1 : 1;
      }
    }

    return 0;
  });
};

const applyUpdate = (document, update = {}) => {
  const nextDocument = clone(document);
  const hasOperators = Object.keys(update).some((key) => key.startsWith('$'));

  if (!hasOperators) {
    Object.entries(update).forEach(([key, value]) => {
      setByPath(nextDocument, key, normalizeValue(value));
    });
    return nextDocument;
  }

  if (update.$set) {
    Object.entries(update.$set).forEach(([key, value]) => {
      setByPath(nextDocument, key, normalizeValue(value));
    });
  }

  if (update.$inc) {
    Object.entries(update.$inc).forEach(([key, value]) => {
      const currentValue = Number(getByPath(nextDocument, key) || 0);
      setByPath(nextDocument, key, currentValue + Number(value));
    });
  }

  if (update.$push) {
    Object.entries(update.$push).forEach(([key, value]) => {
      const currentValue = getByPath(nextDocument, key) || [];
      setByPath(nextDocument, key, [...currentValue, normalizeValue(value)]);
    });
  }

  if (update.$addToSet) {
    Object.entries(update.$addToSet).forEach(([key, value]) => {
      const currentValue = getByPath(nextDocument, key) || [];
      const normalized = normalizeValue(value);
      if (!currentValue.some((item) => compareValues(item, normalized))) {
        setByPath(nextDocument, key, [...currentValue, normalized]);
      }
    });
  }

  return nextDocument;
};

const buildAggregateId = (document, expression) => {
  if (expression == null) {
    return null;
  }

  if (typeof expression === 'string' && expression.startsWith('$')) {
    return getByPath(document, expression.slice(1));
  }

  if (typeof expression === 'object') {
    return Object.entries(expression).reduce((result, [key, operator]) => {
      if (operator.$year) {
        const value = getByPath(document, operator.$year.slice(1));
        result[key] = new Date(value).getFullYear();
      }

      if (operator.$month) {
        const value = getByPath(document, operator.$month.slice(1));
        result[key] = new Date(value).getMonth() + 1;
      }

      return result;
    }, {});
  }

  return expression;
};

const buildAggregateValue = (document, expression) => {
  if (expression === 1) {
    return 1;
  }

  if (typeof expression === 'string' && expression.startsWith('$')) {
    return Number(getByPath(document, expression.slice(1)) || 0);
  }

  return Number(expression || 0);
};

const runAggregate = (records, pipeline = []) => {
  let result = clone(records);

  pipeline.forEach((stage) => {
    if (stage.$group) {
      const groups = new Map();
      const groupIdExpression = stage.$group._id;
      const accumulatorEntries = Object.entries(stage.$group).filter(([key]) => key !== '_id');

      result.forEach((document) => {
        const groupId = buildAggregateId(document, groupIdExpression);
        const groupKey = JSON.stringify(groupId);

        if (!groups.has(groupKey)) {
          groups.set(groupKey, { _id: groupId });
        }

        const currentGroup = groups.get(groupKey);
        accumulatorEntries.forEach(([key, accumulator]) => {
          if (accumulator.$sum != null) {
            currentGroup[key] = Number(currentGroup[key] || 0) + buildAggregateValue(document, accumulator.$sum);
          }
        });
      });

      result = Array.from(groups.values());
    }

    if (stage.$sort) {
      result = sortRecords(result, stage.$sort);
    }

    if (stage.$limit) {
      result = result.slice(0, stage.$limit);
    }
  });

  return result;
};

const getReferenceModelName = (model, populatePath) => {
  const schemaPath = model.schema.path(populatePath);

  if (schemaPath?.options?.ref) {
    return schemaPath.options.ref;
  }

  if (schemaPath?.caster?.options?.ref) {
    return schemaPath.caster.options.ref;
  }

  return null;
};

const populateValue = (referenceModelName, referenceId) => {
  if (!referenceId) {
    return null;
  }

  const referenceCollection = readCollection(referenceModelName);
  return referenceCollection.find((item) => compareValues(item._id, referenceId)) || null;
};

const populatePathOnRecord = (record, pathSegments, referenceModelName) => {
  if (!record) {
    return record;
  }

  const [currentSegment, ...restSegments] = pathSegments;

  if (Array.isArray(record)) {
    return record.map((item) => populatePathOnRecord(item, pathSegments, referenceModelName));
  }

  if (!restSegments.length) {
    const rawValue = record[currentSegment];
    if (Array.isArray(rawValue)) {
      record[currentSegment] = rawValue.map((item) => populateValue(referenceModelName, item)).filter(Boolean);
      return record;
    }

    record[currentSegment] = populateValue(referenceModelName, rawValue);
    return record;
  }

  record[currentSegment] = populatePathOnRecord(record[currentSegment], restSegments, referenceModelName);
  return record;
};

const populateRecords = (records, model, populatePaths = []) => {
  const normalizedRecords = clone(records);

  populatePaths.forEach((populatePath) => {
    const referenceModelName = getReferenceModelName(model, populatePath);
    if (!referenceModelName) {
      return;
    }

    const pathSegments = populatePath.split('.');
    if (Array.isArray(normalizedRecords)) {
      normalizedRecords.forEach((record) => populatePathOnRecord(record, pathSegments, referenceModelName));
    } else {
      populatePathOnRecord(normalizedRecords, pathSegments, referenceModelName);
    }
  });

  return normalizedRecords;
};

const ensureId = (document) => normalizeValue(document._id || new mongoose.Types.ObjectId().toString());

const prepareForStorage = async (model, documentLike) => {
  const plainDocument =
    typeof documentLike?.toObject === 'function'
      ? documentLike.toObject({ depopulate: true, getters: false, virtuals: false })
      : clone(documentLike);

  const prepared = normalizeValue(plainDocument);
  prepared._id = ensureId(prepared);

  if (model.modelName === 'User' && prepared.password && !String(prepared.password).startsWith('$2')) {
    prepared.password = await bcrypt.hash(prepared.password, 10);
  }

  return prepared;
};

const hydrateDocument = (model, document) => {
  if (!document) {
    return null;
  }

  const hydrated = model.hydrate(clone(document));

  hydrated.save = async function saveJsonDocument() {
    const collection = readCollection(model.modelName);
    const prepared = await prepareForStorage(model, this);
    const timestamp = new Date().toISOString();

    prepared.updatedAt = timestamp;
    if (!prepared.createdAt) {
      prepared.createdAt = timestamp;
    }

    const index = collection.findIndex((item) => compareValues(item._id, prepared._id));
    if (index === -1) {
      collection.push(prepared);
    } else {
      collection[index] = prepared;
    }

    writeCollection(model.modelName, collection);
    return hydrateDocument(model, prepared);
  };

  return hydrated;
};

class JsonQuery {
  constructor(model, operation) {
    this.model = model;
    this.operation = operation;
    this.populatePaths = [];
    this.sortSpecification = null;
    this.limitCount = null;
    this.asLean = false;
  }

  populate(paths) {
    if (!paths) {
      return this;
    }

    const normalizedPaths = Array.isArray(paths) ? paths : String(paths).split(' ');
    this.populatePaths.push(...normalizedPaths.filter(Boolean));
    return this;
  }

  sort(specification) {
    this.sortSpecification = specification;
    return this;
  }

  limit(limitCount) {
    this.limitCount = limitCount;
    return this;
  }

  lean() {
    this.asLean = true;
    return this;
  }

  async resolve() {
    let result = await this.operation();

    if (Array.isArray(result) && this.sortSpecification) {
      result = sortRecords(result, this.sortSpecification);
    }

    if (Array.isArray(result) && Number.isFinite(this.limitCount)) {
      result = result.slice(0, this.limitCount);
    }

    if (this.populatePaths.length) {
      result = populateRecords(result, this.model, this.populatePaths);
    }

    if (this.asLean) {
      return clone(result);
    }

    if (Array.isArray(result)) {
      return result.map((item) => hydrateDocument(this.model, item));
    }

    return hydrateDocument(this.model, result);
  }

  then(resolve, reject) {
    return this.resolve().then(resolve, reject);
  }

  catch(reject) {
    return this.resolve().catch(reject);
  }

  finally(onFinally) {
    return this.resolve().finally(onFinally);
  }
}

const createQuery = (model, operation) => new JsonQuery(model, operation);

const patchModel = (model) => {
  if (!model || patchedModels.has(model.modelName)) {
    return model;
  }

  model.find = (filter = {}) =>
    createQuery(model, async () => readCollection(model.modelName).filter((item) => matchesFilter(item, filter)));

  model.findOne = (filter = {}) =>
    createQuery(model, async () => readCollection(model.modelName).find((item) => matchesFilter(item, filter)) || null);

  model.findById = (id) =>
    createQuery(model, async () => readCollection(model.modelName).find((item) => compareValues(item._id, id)) || null);

  model.findOneAndUpdate = (filter = {}, update = {}, options = {}) =>
    createQuery(model, async () => {
      const collection = readCollection(model.modelName);
      const index = collection.findIndex((item) => matchesFilter(item, filter));
      const timestamp = new Date().toISOString();

      if (index === -1) {
        if (!options.upsert) {
          return null;
        }

        const createdDocument = applyUpdate(
          {
            _id: new mongoose.Types.ObjectId().toString(),
            createdAt: timestamp,
            updatedAt: timestamp
          },
          update
        );
        collection.push(createdDocument);
        writeCollection(model.modelName, collection);
        return createdDocument;
      }

      const nextDocument = applyUpdate(collection[index], update);
      nextDocument.updatedAt = timestamp;
      collection[index] = nextDocument;
      writeCollection(model.modelName, collection);
      return options.new === false ? collection[index] : nextDocument;
    });

  model.findByIdAndUpdate = (id, update = {}, options = {}) =>
    createQuery(model, async () => {
      const collection = readCollection(model.modelName);
      const index = collection.findIndex((item) => compareValues(item._id, id));
      if (index === -1) {
        return null;
      }

      const nextDocument = applyUpdate(collection[index], update);
      nextDocument.updatedAt = new Date().toISOString();
      collection[index] = nextDocument;
      writeCollection(model.modelName, collection);
      return options.new === false ? collection[index] : nextDocument;
    });

  model.create = async (payload) => {
    const collection = readCollection(model.modelName);
    const documents = Array.isArray(payload) ? payload : [payload];
    const createdDocuments = [];

    for (const item of documents) {
      const timestamp = new Date().toISOString();
      const prepared = await prepareForStorage(model, item);
      prepared.createdAt = prepared.createdAt || timestamp;
      prepared.updatedAt = timestamp;
      collection.push(prepared);
      createdDocuments.push(prepared);
    }

    writeCollection(model.modelName, collection);

    if (Array.isArray(payload)) {
      return createdDocuments.map((document) => hydrateDocument(model, document));
    }

    return hydrateDocument(model, createdDocuments[0]);
  };

  model.insertMany = async (documents = []) => model.create(documents);

  model.deleteMany = async (filter = {}) => {
    const collection = readCollection(model.modelName);
    const retainedDocuments = collection.filter((item) => !matchesFilter(item, filter));
    writeCollection(model.modelName, retainedDocuments);
    return { deletedCount: collection.length - retainedDocuments.length };
  };

  model.countDocuments = async (filter = {}) => readCollection(model.modelName).filter((item) => matchesFilter(item, filter)).length;

  model.aggregate = async (pipeline = []) => runAggregate(readCollection(model.modelName), pipeline);

  patchedModels.add(model.modelName);
  return model;
};

const enableJsonFallback = () => {
  Object.values(mongoose.models).forEach((model) => patchModel(model));
};

module.exports = {
  enableJsonFallback,
  patchModel
};
