import exec from './exec';
import bundle from './bundle';

export default function(app) {
  exec(app);
  bundle(app);

  return app;
};
