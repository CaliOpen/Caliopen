import React, { Component } from 'react';
import { action } from '@kadira/storybook'; // eslint-disable-line
import Devices from '../../src/scenes/Devices/presenter';

import { Code, ComponentWrapper } from '../presenters';

class Presenter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      props: {
        hr: false,
      },
    };
  }

  render() {
    const props = {
      __: str => str,
      devices: [
        { 'device_id': '4537-es79-0001', 'name': 'Laptop work', 'type': 'laptop', signature_key: 'w00t', 'date_insert': "2016-05-09T15:01:42", 'last_seen': '2017-02-01T15:00:42', 'status': 'master', 'pi': 99, 'ips': ['10.9.52.65', '192.168.1.1'], 'os': 'Linux', 'os_version': 'arch'},
        { 'device_id': '3237-es79-0002', 'name': 'Desktop', 'type': 'desktop', signature_key: null, 'date_insert': "2016-05-09T15:01:42", 'last_seen': '2017-01-01T15:00:42', 'status': '', 'pi': 75, 'ips': [], 'os': 'Linux', 'os_version': 'arch'},
        { 'device_id': '4556-es79-0003', 'name': 'Smartphone', 'type': 'smartphone', signature_key: 'w00t', 'date_insert': "2016-05-09T15:01:42", 'last_seen': '2017-01-01T15:00:42', 'status': '', },
        { 'device_id': '4997-es79-0004', 'name': 'my smart fridge', 'type': 'tablet', signature_key: 'w00t', 'date_insert': "2012-04-20T16:20:00", 'last_seen': '2012-04-20T16:20:00', 'status': '', },
      ],
      requestDevices: () => {},
      // router props
      params: {},
    };

    return (
      <div>
        <ComponentWrapper>
          <Devices {...props} />
        </ComponentWrapper>
        <Code>
          {`
            `}
        </Code>
      </div>
    );
  }
}

export default Presenter;
