export const paginateAndSort = async (
  model,
  { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1, filter = {} }, // Add filter parameter
  populateOptions = [],
) => {
  const skip = (page - 1) * limit;

  // Adjusting sort order for alphabetical sorting when sortBy is 'title'
  let sort;
  if (sortBy === 'title' && sortOrder.toString() === '1') {
    sort = { [sortBy]: 'asc' };
  } else if (sortBy === 'title' && sortOrder.toString() === '-1') {
    sort = { [sortBy]: 'desc' };
  } else {
    sort = { [sortBy]: sortOrder };
    }
    
  const results = await model
    .find(filter) 
    .populate(populateOptions)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .exec();

  const totalRecords = await model.countDocuments(filter); // Apply the same filter here
  const totalPages = Math.ceil(totalRecords / limit);

  return {
    totalPages,
    currentPage: page,
    totalRecords,
    results,
  };
};
