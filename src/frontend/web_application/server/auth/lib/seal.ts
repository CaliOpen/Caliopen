import Iron from 'iron';

export function encode(obj: object, secret: string) {
  return Iron.seal(obj, secret, Iron.defaults);
}

export function decode(sealed: string, secret: string) {
  return Iron.unseal(sealed, secret, Iron.defaults);
}
