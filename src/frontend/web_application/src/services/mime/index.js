import { parse, factory } from 'mimemessage';
import base64 from 'base64-js';
import utf8 from 'utf8';
import quotedPrintable from 'quoted-printable';
import { utf8ArrayToString } from '../encode-utils';

const findEntityByContentType = (entity, contentType) => {
  if (entity.isMultiPart()) {
    return entity.body.reduce(
      (acc, part) => findEntityByContentType(part, contentType) || acc,
      null
    );
  }

  const { fulltype } = entity.contentType();
  if (fulltype === contentType) {
    return entity;
  }

  return null;
};

// mail sometimes do not have CRLF as they should.
const crlfize = (str) => str.replace(/([^\r])?\n/g, '$1\r\n');

export const getPlainTextFromMime = ({ body }) => {
  const entity = parse(crlfize(body));

  if (entity) {
    const plainBody = findEntityByContentType(entity, 'text/plain');

    if (plainBody) {
      const contentTransferEncoding = plainBody.contentTransferEncoding();

      switch (contentTransferEncoding) {
        case 'quoted-printable':
          return utf8.decode(quotedPrintable.decode(plainBody.body));
        case 'base64':
          return utf8ArrayToString(base64.toByteArray(plainBody.body));
        default:
          return plainBody.body;
      }
    }
  }

  return body;
};

export const mimeEncapsulate = (body) =>
  factory({
    contentType: 'text/plain;charset=utf8',
    body,
  });
