import groupMessages from './';

describe('service MessageList groupMessages', () => {
  it('give an object with empty results', () => {
    expect(groupMessages([])).toEqual({});
  });

  it('give an object with 2 groups', () => {
    const messages = [
      { date_sort: '2017-01-03' },
      { date_sort: '2017-01-01' },
      { date_sort: '2017-01-01' },
    ];

    expect(groupMessages(messages)).toEqual({
      [(new Date(2017, 0, 1)).toISOString()]: [messages[1], messages[2]],
      [(new Date(2017, 0, 3)).toISOString()]: [messages[0]],
    });
  });

  // disable this functionnality since it will removed in the next iteration on design
  // cf. https://projects.invisionapp.com/d/main#/console/12883684/296629155/preview
  // it('add a group for today with full date using the first date', () => {
  //   const oneHourAgo = new Date();
  //   const twoHoursAgo = new Date();
  //   oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  //   twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
  //   const messages = [
  //     { date_sort: twoHoursAgo.toJSON() },
  //     { date_sort: oneHourAgo.toJSON() },
  //   ];
  //
  //   expect(groupMessages(messages)).toEqual({
  //     [twoHoursAgo.toJSON()]: [
  //       messages[0], messages[1],
  //     ],
  //   });
  // });

  it('should\'nt group today\'s message with old one', () => {
    const now = new Date();
    const messages = [
      { body: 't1', date_sort: '2018-05-29T13:46:59.992Z' },
      { body: 't2', date_sort: '2018-06-01T16:47:07.739Z' },
      { body: 't3', date_sort: '2018-06-01T16:50:07.739Z' },
      { body: 'now', date_sort: now.toJSON() },
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    expect(groupMessages(messages)).toEqual({
      [(new Date(2018, 4, 29)).toISOString()]: [
        messages[0],
      ],
      [(new Date(2018, 5, 1)).toISOString()]: [
        messages[1], messages[2],
      ],
      [today.toISOString()]: [
        messages[3],
      ],
    });
  });
});
