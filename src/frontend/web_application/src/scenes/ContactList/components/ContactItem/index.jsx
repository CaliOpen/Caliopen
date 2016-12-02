// const ContactItem = `
//   <Link to={`/contacts/${contact.contact_id}`}
//     class="s-contact-list__contact m-block-list__item-content m-block-list__item-content--link"
//   >
//     <div class="s-contact-list__col-avatar">
//       <avatar-letter contact="$ctrl.contact" props="{ size: 'small' }"></avatar-letter>
//     </div>
//     <div class="s-contact-list__col-name m-text-line">
//       {contact.title}
//     </div>
//     <div class="s-contact-list__col-datas">
//     </div>
//   </Link>
// `;


// -------
// XXX: move ContactAvatarLetter to generic components, may need to be fixed
//
// const classNameModifiers = {
//   small: 'm-avatar--small',
//   medium: 'm-avatar--medium',
//   large: 'm-avatar--large',
//   xlarge: 'm-avatar--xlarge',
// };
// const classNameSize = Object.keys(classNameModifiers).find(props.size);
// const letterClassNameSize = classNameSize ? `${classNameSize}__letter` : null;
// const ContactAvatarLetter = `
// <div className={classnames('m-avatar', classNameSize)}>
  // <ContactIconLetter
  //   className={classnames('m-avatar__letter', letterClassNameSize)}
  //   contact={contact}
  // />
// </div>
// `;
//
// const avatarScss = `
// $m-avatar__size: (
//   small:  2rem,
//   medium: 3rem,
//   large:  4rem,
//   xlarge: 6rem
// );
//
// @mixin m-avatar--size($size) {
//   @if type-of($size) == string {
//     $size: map-get($m-avatar__size, $size);
//   }
//
//   width: $size;
//   height: $size;
//
//   &__letter {
//     &::before {
//       font-size: $size * .75;
//       line-height: $size;
//     }
//   }
// }
//
// .m-avatar {
//   display: inline-block;
//   vertical-align: middle;
//   border-radius: $co-radius;
//   background-color: $co-color__fg__back;
//   overflow: hidden;
//
//   &__letter {
//     &::before {
//       display: block;
//
//       color: $co-color__fg__text--high;
//       text-align: center;
//     }
//   }
//
//   @include m-avatar--size(medium);
//
//   &--small  { @include m-avatar--size(small);  }
//   &--medium { @include m-avatar--size(medium); }
//   &--large  { @include m-avatar--size(large);  }
//   &--xlarge { @include m-avatar--size(xlarge); }
// }
// `;
