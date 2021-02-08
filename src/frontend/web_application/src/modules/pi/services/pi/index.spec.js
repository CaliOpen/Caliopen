import { getAngles, getAveragePI, getAveragePIMessage, PI_PROPERTIES } from '.';

describe('MultidimensionalPi > services > pi', () => {
  describe('getAngles', () => {
    it('gives 360 / 3 or n props', () => {
      expect(getAngles()).toEqual(360 / PI_PROPERTIES.length);
    });
  });
  describe('getAveragePI', () => {
    it('gives a basic average value', () => {
      expect(
        getAveragePI({
          comportment: 5,
          technic: 10,
          context: 15,
          rab: 20,
          version: 1,
        })
      ).toEqual((5 + 10 + 15) / 3);
    });
  });

  describe('getAveragePIMessage', () => {
    it('gives a basic average PIMessage value ', () => {
      expect(
        getAveragePIMessage({
          message: {
            pi_message: {
              content: 5,
              transport: 10,
              social: 15,
              rab: 20,
              version: 1,
            },
          },
        })
      ).toEqual((5 + 10 + 15) / 3);
    });
  });
});
