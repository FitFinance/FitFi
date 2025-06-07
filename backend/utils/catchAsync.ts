function catchAsync(fn: (req: any, res: any, next: any) => any) {
  console.log('running catch Async');
  return function (req: any, res: any, next: any) {
    try {
      console.log('trying');
      Promise.resolve(fn(req, res, next)).catch(next);
    } catch (err) {
      console.log('catching sync error');

      next(err);
    }
  };
}

export default catchAsync;
