import 'raf/polyfill';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { saveConfig } from 'src/modules/device/services/storage';
import { cleanup } from '@testing-library/react';
import './lingui-react';
import '@testing-library/jest-dom';
import { server } from '../server';

beforeAll(() => {
  // Save mandatory device for signed request
  saveConfig({
    id: 'test',
    priv: 'private',
    hash: 'a-hash',
    curve: 'whatever',
  });
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// TODO: Clean enzyme
configure({ adapter: new Adapter() });
