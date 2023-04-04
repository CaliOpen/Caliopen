import {
  computeScoreLetter,
  getAngles,
  getAveragePI,
  getAveragePIMessage,
  PI_PROPERTIES,
} from '.';

describe('MultidimensionalPi > services > pi', () => {
  describe('getAngles', () => {
    it('gives 360 / 3 or n props', () => {
      expect(getAngles()).toEqual(360 / PI_PROPERTIES.length);
    });
  });
  describe('getAveragePI', () => {
    it('gives a basic average value', () => {
      expect(
        getAveragePI(
          {
            comportment: 5,
            technic: 10,
            context: 15,
            version: 1,
          },
          PI_PROPERTIES
        )
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

  describe('computeScoreLetter', () => {
    it('calc', () => {
      expect(computeScoreLetter(100)).toEqual('A');
      expect(computeScoreLetter(90)).toEqual('A');
      expect(computeScoreLetter(81)).toEqual('A');
      expect(computeScoreLetter(80)).toEqual('B');
      expect(computeScoreLetter(66)).toEqual('B');
      expect(computeScoreLetter(61)).toEqual('B');
      expect(computeScoreLetter(60)).toEqual('C');
      expect(computeScoreLetter(50)).toEqual('C');
      expect(computeScoreLetter(41)).toEqual('C');
      expect(computeScoreLetter(40)).toEqual('D');
      expect(computeScoreLetter(33)).toEqual('D');
      expect(computeScoreLetter(30)).toEqual('D');
      expect(computeScoreLetter(21)).toEqual('D');
      expect(computeScoreLetter(20)).toEqual('E');
      expect(computeScoreLetter(10)).toEqual('E');
      expect(computeScoreLetter(0)).toEqual('E');
    });

    it('calc above min/max', () => {
      expect(computeScoreLetter(150)).toEqual('A');
      expect(computeScoreLetter(-100)).toEqual('E');
    });
  });
});
