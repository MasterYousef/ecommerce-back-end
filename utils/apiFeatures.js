class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filterAndSearch(modelName) {
    const query = { ...this.queryString };
    const skipQuerys = ["limit", "sort", "page", "fields", "keyword"];
    skipQuerys.forEach((v) => delete query[v]);
    Object.entries(query).map(([key, value]) =>
      value.length <= 0 ? delete query[key] : null
    );
    let fillter = JSON.stringify(query);
    fillter = fillter.replace(/\b(gte|gt|lte|lt)\b/g, (v) => `$${v}`);
    if (Object.keys(JSON.parse(fillter)).length <= 0) {
      fillter = { price: { $gt: 0 } };
    }else{
      fillter = JSON.parse(fillter)
    }
    let words;
    if (this.queryString.keyword) {
      const keywords = this.queryString.keyword;
      words = {};
      if (modelName === "product") {
        fillter.$or = [
          { title: { $regex: keywords, $options: "i" } },
          { description: { $regex: keywords, $options: "i" } }
        ];
      } else {
        words.$or = [{ name: { $regex: keywords, $options: "i" } }, fillter];
      }
    }
    this.mongooseQuery = this.mongooseQuery.find(fillter);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortby = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortby);
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-_v");
    }
    return this;
  }

  paginate(countDocuments) {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 9;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;
    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit);
    if (endIndex < countDocuments) {
      pagination.next = page + 1;
    }
    if (skip > 0) {
      pagination.prev = page - 1;
    }
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    this.paginationResult = pagination;
    return this;
  }
}

module.exports = ApiFeatures;
