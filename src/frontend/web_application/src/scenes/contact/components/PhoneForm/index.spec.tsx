import * as React from "react";
import { shallow } from "enzyme";
import "test/unit/lingui-react";
import PhoneForm from ".";

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("component PhoneForm", () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("init form", () => {
    const props = {
      i18n: { _: (id, values) => id },
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
      onDelete: jest.fn(),
    };

    const comp = shallow(<PhoneForm {...props} />).dive();

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(comp.text()).toEqual("<FormGrid />");
  });
});
