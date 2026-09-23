export const sendResponse = (res, statusCode = 200, { success = true, message = '', data = null, meta = null }) => {
  const payload = {
    success,
    message,
    ...(data !== null && { data }),
    ...(meta !== null && { meta }),
  };

  return res.status(statusCode).json(payload);
};

export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200, meta = null) => {
  return sendResponse(res, statusCode, {
    success: true,
    message,
    data,
    meta,
  });
};
