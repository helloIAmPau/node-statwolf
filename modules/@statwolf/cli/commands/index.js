import exec from './exec';
import bundle from './bundle';
import listTemplate from './list-template';
import template from './template';

export default function(app) {
  exec(app);
  bundle(app);
  listTemplate(app);
  template(app);

  return app;
};
