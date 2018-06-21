# CaliOpen Scss reference

**Important note:**

> The following document has been imported as is from the previous client in angularJs; the file
> structure has changed: each component import its stylsheets. Some rules may have changed and will
> reported asap in this document

---

**Requirements:**

A basic knowledge of ITCSS and BEM is highly recommanded.

* [A  conference of Harry Roberts](https://www.youtube.com/watch?v=1OKZOV-iLj4) about managing css with ITCSS (1:13)
* [BEM](http://getbem.com/introduction/) introduction

---

A CSS architecture is subject to two opposing interests. For one hand, we want a set of **generic
and modular** components we can use freely and easily maintain. On the other hand, we want an
ergonomic interface and a semantic code, so **specific** to each task or showed information.

An unorganized CSS will tend to have across all components a high specificity. The presented
architecture aims to enable a complex interface to have **a modular, a generic, and therefore a
maintainable code**.

1. [Organization](#organization)
    - [Layout](#layout)
    - [Section](#section)
    - [Module](#module)
2. [Development rules](#development-rules)
    - [Components](#components)
    - [Placeholders, variables, and mixins](#placeholders-variables-and-mixins)
3. [Examples](#examples)
    - [Define a module](#define-a-module)
    - [Use this module in a section](#use-this-module-in-a-section)
    - [Use this section in the layout](#use-this-section-in-the-layout)

## Organization

Each element used in the HTML is a component.

A component must:
- follow the **BEM method** (*block* having *elements* and *modifiers*) with *states*
- be an semantic or interactive object (not an utility)
- be simple (always split a component into several when possible)
- only manage its own internal properties (no `position` or `float` on himself) or those of its
  *elements*
- if possible, modify its sub-components with only their own *modifiers*

Components are divided into several categories: `layout`, `section` and `module`, and respectively
prefixed with `l-`, `s-` and `m-`. Each category have a specific approach.

### Layout

An element composing the static part of the application.

A layout component must:
- does not have a parent component
- define its own positioning, disposition
- define its behaviour (standard and responsive) and its direct sub-components's one

### Section

A semantic set, which does not have meaning outside of the application, but is still functional.

A section must:

- be modular, reusable
- define its behaviour (standard and responsive) and its direct sub-components's one

### Module

An atomic and generic component, independent of the application meaning.

A module must:
- be atomic, re-used as much as possible
- be generic, have a simple and no-responsive behaviour
- provide modifiers (allowing among other things to make itself responsive)


## Development rules

### Components

A component must apply the following naming rules:

- Only uses `.classes`, not `#IDs`
- BEM syntax: `component`, `component__element`, `component--modifier`
- Component prefixed following its category: `l-`, `s-` or `m-`
- *State* prefixed by `is-`: `component.is-state`

**Note**:
If a component assume that one of its **elements** is a component (generally by applying on it a
modifier), this *element* must be named as this component (prefix included).


### Placeholders, variables, and mixins

A module must provide:
- a placeholder, which only bring the standard behaviour and modifiers
- a placeholder (if possible) and a mixin for each of its modifiers

**Variables, placeholders and mixins must follow a BEM-like syntax:**

If they are globals (configuration or utilities):
- variable: `$namespace__variable--variant`
- placeholder: `%namespace--variant`
- mixin: `namespace--variant()`

If they are related to a component:
- variable: `$component__variable--variant`
- placeholder: `%component--modifier`
- mixin: `component--modifier()`

All variable, placeholder or mixin which shouldn't be used outside of a component declaration is
considered as "private" and must be prefixed with an underscore (`_`).


##Examples

### Define a module

Define a single component, a module, with its variables, default properties, elements and modifiers.
Keep the same setup and syntax for Layout and Section components.

**`_m-module.scss`**
```scss
// Variables
$m-module__size: 10rem !default; // public
$_m-module__font-size: 1rem;     // private

// Modifiers
@mixin  m-module--white {
  background: white;

  &__text {
    color: black;
  }
}

@mixin  m-module--black {
  background: black;

  &__text {
    color: white;
  }
}

// Component
.m-module {
  // default properties
  height: $m-module__size;
  width: $m-module__size;

  // Elements
  &__text {
    font-size: $_m-module__font-size;
  }

  // Modifiers
  &, // (default: --white)
  &--white { @include m-module--white; }
  &--black { @include m-module--black; }
}
```

**`example-1.html`**
```html
...
<div class="m-module">
  <div class="m-module__text">
    I'm black on white
  </div>
</div>

<div class="m-module m-module--black">
  <div class="m-module__text m-module--black__text">
    I'm white on black
  </div>
</div>
...
```

### Use this module in a section

Use the previous `m-module` component in a section. A section shouldn't define modifier. It only
define a semantic and responsive behavior from other components modifiers.

**`_s-section.scss`**
```scss
.s-section {
  background: red;

  // Elements
  &__element {
    ...
  }

  // Sub-components
  &__m-module {
    @include m-module--black;
  }

  // Responsive behavior (with Foundation mixins)
  @include breakpoint(medium) {

    &__m-module {
      @include m-module--white;
    }

  }
}
```

**`example-2.html`**
```html
...
<div class="s-section">
  <div class="s-section__element">
    ...
  </div>

  <div class="s-section__m-module m-module">
    <div class="s-section__m-module__text m-module__text">
      I'm white on black on module,
      and black on white on pc !
    </div>
  </div>
</div>
...
```

### Use this section in the layout

Use the previous `s-section` component in a layout component. A layout component is like (with a
semantic and responsive behavior), but does not have to be modular, because it define its own
position.

**`_l-layout.scss`**
```scss
.l-layout {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;

  padding: .5rem;
}
```

**`example-3.html`**
```html
<div class="l-layout">
  <div class="s-section">
    ...
  </div>
</div>
```
