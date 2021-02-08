import ErrorComponent from '../error/components/Error';
import createEngine from './create-engine';
import View from './view';

export const configure = (app) => {
  app.set('view', View);
  app.set('view engine', 'component');
  app.engine(
    'component',
    createEngine({
      'error.component': ErrorComponent,
    })
  );
};
