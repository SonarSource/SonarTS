@title
Style Guide

@intro
Write Angular with style.

@description


Looking for an opinionated guide to Angular syntax, conventions, and application structure?
Step right in!
This style guide presents preferred conventions and, as importantly, explains why.



{@a toc}

<!--

# Contents

  * [Single responsibility](guide/styleguide#single-responsibility)
  * [Naming](guide/styleguide#naming)
  * [Coding conventions](guide/styleguide#coding-conventions)
  * [App structure and Angular modules](guide/styleguide#application-structure-and-angular-modules)
  * [Components](guide/styleguide#components)
  * [Directives](guide/styleguide#directives)
  * [Services](guide/styleguide#services)
  * [Data services](guide/styleguide#data-services)
  * [Lifecycle hooks](guide/styleguide#lifecycle-hooks)
  * [Appendix](guide/styleguide#appendix)

-->

## Style vocabulary

Each guideline describes either a good or bad practice, and all have a consistent presentation.

The wording of each guideline indicates how strong the recommendation is.


<div class="s-rule do">



**Do** is one that should always be followed.
_Always_ might be a bit too strong of a word.
Guidelines that literally should always be followed are extremely rare.
On the other hand, you need a really unusual case for breaking a *Do* guideline.


</div>



<div class="s-rule consider">



**Consider** guidelines should generally be followed.
If you fully understand the meaning behind the guideline and have a good reason to deviate, then do so. Please strive to be consistent.


</div>



<div class="s-rule avoid">



**Avoid** indicates something you should almost never do. Code examples to *avoid* have an unmistakeable red header.


</div>



<div class="s-why">



**Why?** gives reasons for following the previous recommendations.


</div>




## File structure conventions

Some code examples display a file that has one or more similarly named companion files.
For example, `hero.component.ts` and `hero.component.html`.

The guideline uses the shortcut `hero.component.ts|html|css|spec` to represent those various files. Using this shortcut makes this guide's file structures easier to read and more terse.



{@a single-responsibility}


## Single responsibility

Apply the
<a href="https://wikipedia.org/wiki/Single_responsibility_principle"><i>single responsibility principle</i> (SRP)</a>
to all components, services, and other symbols.
This helps make the app cleaner, easier to read and maintain, and more testable.

{@a 01-01}

### Rule of One

#### Style 01-01


<div class="s-rule do">



**Do** define one thing, such as a service or component, per file.


</div>



<div class="s-rule consider">



**Consider** limiting files to 400 lines of code.


</div>



<div class="s-why">



**Why?** One component per file makes it far easier to read, maintain, and avoid
collisions with teams in source control.


</div>



<div class="s-why">



**Why?** One component per file avoids hidden bugs that often arise when combining components in a file where they may share variables, create unwanted closures, or unwanted coupling with dependencies.


</div>



<div class="s-why-last">



**Why?** A single component can be the default export for its file which facilitates lazy loading with the router.

</div>



The key is to make the code more reusable, easier to read, and less mistake prone.

The following *negative* example defines the `AppComponent`, bootstraps the app,
defines the `Hero` model object, and loads heroes from the server all in the same file.
*Don't do this*.


<code-example path="styleguide/src/01-01/app/heroes/hero.component.avoid.ts" title="app/heroes/hero.component.ts">

</code-example>



It is a better practice to redistribute the component and its
supporting classes into their own, dedicated files.


<code-tabs>

  <code-pane title="main.ts" path="styleguide/src/01-01/main.ts">

  </code-pane>

  <code-pane title="app/app.module.ts" path="styleguide/src/01-01/app/app.module.ts">

  </code-pane>

  <code-pane title="app/app.component.ts" path="styleguide/src/01-01/app/app.component.ts">

  </code-pane>

  <code-pane title="app/heroes/heroes.component.ts" path="styleguide/src/01-01/app/heroes/heroes.component.ts">

  </code-pane>

  <code-pane title="app/heroes/shared/hero.service.ts" path="styleguide/src/01-01/app/heroes/shared/hero.service.ts">

  </code-pane>

  <code-pane title="app/heroes/shared/hero.model.ts" path="styleguide/src/01-01/app/heroes/shared/hero.model.ts">

  </code-pane>

  <code-pane title="app/heroes/shared/mock-heroes.ts" path="styleguide/src/01-01/app/heroes/shared/mock-heroes.ts">

  </code-pane>

</code-tabs>



As the app grows, this rule becomes even more important.
<a href="#toc">Back to top</a>


{@a 01-02}

### Small functions

#### Style 01-02


<div class="s-rule do">



**Do** define small functions


</div>



<div class="s-rule consider">



**Consider** limiting to no more than 75 lines.


</div>



<div class="s-why">



**Why?** Small functions are easier to test, especially when they do one thing and serve one purpose.


</div>



<div class="s-why">



**Why?** Small functions promote reuse.


</div>



<div class="s-why">



**Why?** Small functions are easier to read.


</div>



<div class="s-why">



**Why?** Small functions are easier to maintain.


</div>



<div class="s-why-last">



**Why?** Small functions help avoid hidden bugs that come with large functions that share variables with external scope, create unwanted closures, or unwanted coupling with dependencies.


</div>

<a href="#toc">Back to top</a>


## Naming

Naming conventions are hugely important to maintainability and readability. This guide recommends naming conventions for the file name and the symbol name.



{@a 02-01}

### General Naming Guidelines

#### Style 02-01


<div class="s-rule do">



**Do** use consistent names for all symbols.


</div>



<div class="s-rule do">



**Do** follow a pattern that describes the symbol's feature then its type. The recommended pattern is `feature.type.ts`.


</div>



<div class="s-why">



**Why?** Naming conventions help provide a consistent way to find content at a glance. Consistency within the project is vital. Consistency with a team is important. Consistency across a company provides tremendous efficiency.


</div>



<div class="s-why">



**Why?** The naming conventions should simply help find desired code faster and make it easier to understand.


</div>



<div class="s-why-last">



**Why?** Names of folders and files should clearly convey their intent. For example, `app/heroes/hero-list.component.ts` may contain a component that manages a list of heroes.


</div>

<a href="#toc">Back to top</a>


{@a 02-02}

### Separate file names with dots and dashes

#### Style 02-02


<div class="s-rule do">



**Do** use dashes to separate words in the descriptive name.


</div>



<div class="s-rule do">



**Do** use dots to separate the descriptive name from the type.


</div>



<div class="s-rule do">



**Do** use consistent type names for all components following a pattern that describes the component's feature then its type. A recommended pattern is `feature.type.ts`.


</div>



<div class="s-rule do">



**Do** use conventional type names including `.service`, `.component`, `.pipe`, `.module`, and `.directive`.
Invent additional type names if you must but take care not to create too many.


</div>



<div class="s-why">



**Why?** Type names provide a consistent way to quickly identify what is in the file.


</div>



<div class="s-why">



**Why?** Type names make it easy to find a specific file type using an editor or IDE's fuzzy search techniques.


</div>



<div class="s-why">



**Why?** Unabbreviated type names such as `.service` are descriptive and unambiguous.
Abbreviations such as `.srv`, `.svc`, and `.serv` can be confusing.


</div>



<div class="s-why-last">



**Why?** Type names provide pattern matching for any automated tasks.


</div>

<a href="#toc">Back to top</a>


{@a 02-03}

### Symbols and file names

#### Style 02-03


<div class="s-rule do">



**Do** use consistent names for all assets named after what they represent.


</div>



<div class="s-rule do">



**Do** use upper camel case for class names.


</div>



<div class="s-rule do">



**Do** match the name of the symbol to the name of the file.


</div>



<div class="s-rule do">



**Do** append the symbol name with the conventional suffix (such as `Component`,
`Directive`, `Module`, `Pipe`, or `Service`) for a thing of that type.


</div>



<div class="s-rule do">



**Do** give the filename the conventional suffix (such as `.component.ts`, `.directive.ts`,
`.module.ts`, `.pipe.ts`, or `.service.ts`) for a file of that type.

</div>



<div class="s-why">



**Why?** Consistent conventions make it easy to quickly identify
and reference assets of different types.


</div>



<table width="100%">

  <col width="50%">

  </col>

  <col width="50%">

  </col>

  <tr>

    <th>
      Symbol Name
    </th>

    <th>
      File Name
    </th>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Component({ ... })
        export class AppComponent { }
      </code-example>

    </td>

    <td>


      app.component.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Component({ ... })
        export class HeroesComponent { }
      </code-example>

    </td>

    <td>


      heroes.component.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Component({ ... })
        export class HeroListComponent { }
      </code-example>

    </td>

    <td>


      hero-list.component.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Component({ ... })
        export class HeroDetailComponent { }
      </code-example>

    </td>

    <td>


      hero-detail.component.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Directive({ ... })
        export class ValidationDirective { }
      </code-example>

    </td>

    <td>


      validation.directive.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @NgModule({ ... })
        export class AppModule
      </code-example>

    </td>

    <td>


      app.module.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Pipe({ name: 'initCaps' })
        export class InitCapsPipe implements PipeTransform { }
      </code-example>

    </td>

    <td>


      init-caps.pipe.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Injectable()
        export class UserProfileService { }
      </code-example>

    </td>

    <td>


      user-profile.service.ts
    </td>

  </tr>

</table>



<a href="#toc">Back to top</a>


{@a 02-04}

### Service names

#### Style 02-04

<div class="s-rule do">



**Do** use consistent names for all services named after their feature.


</div>



<div class="s-rule do">



**Do** suffix a service class name with `Service`.
For example, something that gets data or heroes
should be called a `DataService` or a `HeroService`.

A few terms are unambiguously services. They typically
indicate agency by ending in "-er". You may prefer to name
a service that logs messages `Logger` rather than `LoggerService`.
Decide if this exception is agreeable in your project.
As always, strive for consistency.


</div>



<div class="s-why">



**Why?** Provides a consistent way to quickly identify and reference services.


</div>



<div class="s-why">



**Why?** Clear service names such as `Logger` do not require a suffix.


</div>



<div class="s-why-last">



**Why?** Service names such as `Credit` are nouns and require a suffix and should be named with a suffix when it is not obvious if it is a service or something else.


</div>



<table width="100%">

  <col width="50%">

  </col>

  <col width="50%">

  </col>

  <tr>

    <th>
      Symbol Name
    </th>

    <th>
      File Name
    </th>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Injectable()
        export class HeroDataService { }
      </code-example>

    </td>

    <td>


      hero-data.service.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Injectable()
        export class CreditService { }
      </code-example>

    </td>

    <td>


      credit.service.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Injectable()
        export class Logger { }
      </code-example>

    </td>

    <td>


      logger.service.ts
    </td>

  </tr>

</table>



<a href="#toc">Back to top</a>


{@a 02-05}

### Bootstrapping

#### Style 02-05


<div class="s-rule do">



**Do** put bootstrapping and platform logic for the app in a file named `main.ts`.


</div>



<div class="s-rule do">



**Do** include error handling in the bootstrapping logic.


</div>



<div class="s-rule avoid">



**Avoid** putting app logic in `main.ts`. Instead, consider placing it in a component or service.


</div>



<div class="s-why">



**Why?** Follows a consistent convention for the startup logic of an app.


</div>



<div class="s-why-last">



**Why?** Follows a familiar convention from other technology platforms.


</div>



<code-example path="styleguide/src/02-05/main.ts" title="main.ts">

</code-example>



<a href="#toc">Back to top</a>

{@a 02-06}

### Directive selectors

#### Style 02-06


<div class="s-rule do">



**Do** Use lower camel case for naming the selectors of directives.


</div>



<div class="s-why">



**Why?** Keeps the names of the properties defined in the directives that are bound to the view consistent with the attribute names.


</div>



<div class="s-why-last">



**Why?** The Angular HTML parser is case sensitive and recognizes lower camel case.


</div>

<a href="#toc">Back to top</a>

{@a 02-07}

### Custom prefix for components

#### Style 02-07


<div class="s-rule do">



**Do** use a hyphenated, lowercase element selector value (e.g. `admin-users`).



</div>



<div class="s-rule do">



**Do** use a custom prefix for a component selector.
For example, the prefix `toh` represents from **T**our **o**f **H**eroes and the prefix `admin` represents an admin feature area.


</div>



<div class="s-rule do">



**Do** use a prefix that identifies the feature area or the app itself.


</div>



<div class="s-why">



**Why?** Prevents element name collisions with components in other apps and with native HTML elements.


</div>



<div class="s-why">



**Why?** Makes it easier to promote and share the component in other apps.


</div>



<div class="s-why-last">



**Why?** Components are easy to identify in the DOM.


</div>



<code-example path="styleguide/src/02-07/app/heroes/hero.component.avoid.ts" region="example" title="app/heroes/hero.component.ts">

</code-example>





<code-example path="styleguide/src/02-07/app/users/users.component.avoid.ts" region="example" title="app/users/users.component.ts">

</code-example>





<code-example path="styleguide/src/02-07/app/heroes/hero.component.ts" region="example" title="app/heroes/hero.component.ts">

</code-example>





<code-example path="styleguide/src/02-07/app/users/users.component.ts" region="example" title="app/users/users.component.ts">

</code-example>





{@a 02-08}

### Custom prefix for directives

#### Style 02-08

<div class="s-rule do">



**Do** use a custom prefix for the selector of directives (e.g, the prefix `toh` from **T**our **o**f **H**eroes).


</div>



<div class="s-rule do">



**Do** spell non-element selectors in lower camel case unless the selector is meant to match a native HTML attribute.


</div>



<div class="s-why">



**Why?** Prevents name collisions.


</div>



<div class="s-why-last">



**Why?** Directives are easily identified.


</div>



<code-example path="styleguide/src/02-08/app/shared/validate.directive.avoid.ts" region="example" title="app/shared/validate.directive.ts">

</code-example>





<code-example path="styleguide/src/02-08/app/shared/validate.directive.ts" region="example" title="app/shared/validate.directive.ts">

</code-example>



<a href="#toc">Back to top</a>


{@a 02-09}

### Pipe names

#### Style 02-09

<div class="s-rule do">



**Do** use consistent names for all pipes, named after their feature.


</div>



<div class="s-why-last">



**Why?** Provides a consistent way to quickly identify and reference pipes.


</div>



<table width="100%">

  <col width="50%">

  </col>

  <col width="50%">

  </col>

  <tr>

    <th>
      Symbol Name
    </th>

    <th>
      File Name
    </th>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Pipe({ name: 'ellipsis' })
        export class EllipsisPipe implements PipeTransform { }
      </code-example>

    </td>

    <td>


      ellipsis.pipe.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Pipe({ name: 'initCaps' })
        export class InitCapsPipe implements PipeTransform { }
      </code-example>

    </td>

    <td>


      init-caps.pipe.ts
    </td>

  </tr>

</table>



<a href="#toc">Back to top</a>


{@a 02-10}

### Unit test file names

#### Style 02-10

<div class="s-rule do">



**Do** name test specification files the same as the component they test.


</div>



<div class="s-rule do">



**Do** name test specification files with a suffix of `.spec`.


</div>



<div class="s-why">



**Why?** Provides a consistent way to quickly identify tests.


</div>



<div class="s-why-last">



**Why?** Provides pattern matching for [karma](http://karma-runner.github.io/) or other test runners.


</div>





<table width="100%">

  <col width="50%">

  </col>

  <col width="50%">

  </col>

  <tr>

    <th>
      Test Type
    </th>

    <th>
      File Names
    </th>

  </tr>

  <tr style=top>

    <td>


      Components
    </td>

    <td>


      heroes.component.spec.ts

      hero-list.component.spec.ts

      hero-detail.component.spec.ts
    </td>

  </tr>

  <tr style=top>

    <td>


      Services
    </td>

    <td>


      logger.service.spec.ts

      hero.service.spec.ts

      filter-text.service.spec.ts
    </td>

  </tr>

  <tr style=top>

    <td>


      Pipes
    </td>

    <td>


      ellipsis.pipe.spec.ts

      init-caps.pipe.spec.ts
    </td>

  </tr>

</table>



<a href="#toc">Back to top</a>


{@a 02-11}

### _End-to-End_ (E2E) test file names

#### Style 02-11

<div class="s-rule do">



**Do** name end-to-end test specification files after the feature they test with a suffix of `.e2e-spec`.


</div>



<div class="s-why">



**Why?** Provides a consistent way to quickly identify end-to-end tests.


</div>



<div class="s-why-last">



**Why?** Provides pattern matching for test runners and build automation.


</div>







<table width="100%">

  <col width="50%">

  </col>

  <col width="50%">

  </col>

  <tr>

    <th>
      Test Type
    </th>

    <th>
      File Names
    </th>

  </tr>

  <tr style=top>

    <td>


      End-to-End Tests
    </td>

    <td>


      app.e2e-spec.ts

      heroes.e2e-spec.ts
    </td>

  </tr>

</table>



<a href="#toc">Back to top</a>

{@a 02-12}

### Angular _NgModule_ names

#### Style 02-12


<div class="s-rule do">



**Do** append the symbol name with the suffix `Module`.


</div>



<div class="s-rule do">



**Do** give the file name the `.module.ts` extension.


</div>



<div class="s-rule do">



**Do** name the module after the feature and folder it resides in.


</div>



<div class="s-why">



**Why?** Provides a consistent way to quickly identify and reference modules.


</div>



<div class="s-why">



**Why?** Upper camel case is conventional for identifying objects that can be instantiated using a constructor.


</div>



<div class="s-why-last">



**Why?** Easily identifies the module as the root of the same named feature.


</div>



<div class="s-rule do">



**Do** suffix a _RoutingModule_ class name with `RoutingModule`.


</div>



<div class="s-rule do">



**Do** end the filename of a _RoutingModule_ with `-routing.module.ts`.


</div>



<div class="s-why-last">



**Why?** A `RoutingModule` is a module dedicated exclusively to configuring the Angular router.
A consistent class and file name convention make these modules easy to spot and verify.

</div>



<table width="100%">

  <col width="50%">

  </col>

  <col width="50%">

  </col>

  <tr>

    <th>
      Symbol Name
    </th>

    <th>
      File Name
    </th>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @NgModule({ ... })
        export class AppModule { }
      </code-example>

    </td>

    <td>


      app.module.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @NgModule({ ... })
        export class HeroesModule { }
      </code-example>

    </td>

    <td>


      heroes.module.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @NgModule({ ... })
        export class VillainsModule { }
      </code-example>

    </td>

    <td>


      villains.module.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @NgModule({ ... })
        export class AppRoutingModule { }
      </code-example>

    </td>

    <td>


      app-routing.module.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @NgModule({ ... })
        export class HeroesRoutingModule { }
      </code-example>

    </td>

    <td>


      heroes-routing.module.ts
    </td>

  </tr>

</table>



<a href="#toc">Back to top</a>


## Coding conventions

Have a consistent set of coding, naming, and whitespace conventions.



{@a 03-01}

### Classes

#### Style 03-01

<div class="s-rule do">



**Do** use upper camel case when naming classes.


</div>



<div class="s-why">



**Why?** Follows conventional thinking for class names.


</div>



<div class="s-why-last">



**Why?** Classes can be instantiated and construct an instance.
By convention, upper camel case indicates a constructable asset.


</div>



<code-example path="styleguide/src/03-01/app/core/exception.service.avoid.ts" region="example" title="app/shared/exception.service.ts">

</code-example>





<code-example path="styleguide/src/03-01/app/core/exception.service.ts" region="example" title="app/shared/exception.service.ts">

</code-example>



<a href="#toc">Back to top</a>


{@a 03-02}

### Constants

#### Style 03-02

<div class="s-rule do">



**Do** declare variables with `const` if their values should not change during the application lifetime.


</div>



<div class="s-why">



**Why?** Conveys to readers that the value is invariant.


</div>



<div class="s-why-last">



**Why?** TypeScript helps enforce that intent by requiring immediate initialization and by
preventing subsequent re-assignment.


</div>



<div class="s-rule consider">



**Consider** spelling `const` variables in lower camel case.


</div>



<div class="s-why">



**Why?** Lower camel case variable names (`heroRoutes`) are easier to read and understand
than the traditional UPPER_SNAKE_CASE names (`HERO_ROUTES`).


</div>



<div class="s-why-last">



**Why?** The tradition of naming constants in UPPER_SNAKE_CASE reflects
an era before the modern IDEs that quickly reveal the `const` declaration.
TypeScript prevents accidental reassignment.


</div>



<div class="s-rule do">



**Do** tolerate _existing_ `const` variables that are spelled in UPPER_SNAKE_CASE.


</div>



<div class="s-why-last">



**Why?** The tradition of UPPER_SNAKE_CASE remains popular and pervasive,
especially in third party modules.
It is rarely worth the effort to change them at the risk of breaking existing code and documentation.


</div>



<code-example path="styleguide/src/03-02/app/core/data.service.ts" title="app/shared/data.service.ts">

</code-example>



<a href="#toc">Back to top</a>


{@a 03-03}

### Interfaces

#### Style 03-03

<div class="s-rule do">



**Do** name an interface using upper camel case.


</div>



<div class="s-rule consider">



**Consider** naming an interface without an `I` prefix.


</div>



<div class="s-rule consider">



**Consider** using a class instead of an interface.


</div>



<div class="s-why">



**Why?** <a href="https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines">TypeScript guidelines</a>
discourage the `I` prefix.


</div>



<div class="s-why">



**Why?** A class alone is less code than a _class-plus-interface_.


</div>



<div class="s-why">



**Why?** A class can act as an interface (use `implements` instead of `extends`).


</div>



<div class="s-why-last">



**Why?** An interface-class can be a provider lookup token in Angular dependency injection.


</div>



<code-example path="styleguide/src/03-03/app/core/hero-collector.service.avoid.ts" region="example" title="app/shared/hero-collector.service.ts">

</code-example>





<code-example path="styleguide/src/03-03/app/core/hero-collector.service.ts" region="example" title="app/shared/hero-collector.service.ts">

</code-example>



<a href="#toc">Back to top</a>

{@a 03-04}

### Properties and methods

#### Style 03-04


<div class="s-rule do">



**Do** use lower camel case to name properties and methods.


</div>



<div class="s-rule avoid">



**Avoid** prefixing private properties and methods with an underscore.


</div>



<div class="s-why">



**Why?** Follows conventional thinking for properties and methods.


</div>



<div class="s-why">



**Why?** JavaScript lacks a true private property or method.


</div>



<div class="s-why-last">



**Why?** TypeScript tooling makes it easy to identify private vs. public properties and methods.


</div>



<code-example path="styleguide/src/03-04/app/core/toast.service.avoid.ts" region="example" title="app/shared/toast.service.ts">

</code-example>





<code-example path="styleguide/src/03-04/app/core/toast.service.ts" region="example" title="app/shared/toast.service.ts">

</code-example>



<a href="#toc">Back to top</a>

{@a 03-06}

### Import line spacing

#### Style 03-06


<div class="s-rule consider">



**Consider** leaving one empty line between third party imports and application imports.


</div>



<div class="s-rule consider">



**Consider** listing import lines alphabetized by the module.


</div>



<div class="s-rule consider">



**Consider** listing destructured imported symbols alphabetically.


</div>



<div class="s-why">



**Why?** The empty line separates _your_ stuff from _their_ stuff.


</div>



<div class="s-why-last">



**Why?** Alphabetizing makes it easier to read and locate symbols.


</div>



<code-example path="styleguide/src/03-06/app/heroes/shared/hero.service.avoid.ts" region="example" title="app/heroes/shared/hero.service.ts">

</code-example>





<code-example path="styleguide/src/03-06/app/heroes/shared/hero.service.ts" region="example" title="app/heroes/shared/hero.service.ts">

</code-example>



<a href="#toc">Back to top</a>


## Application structure and Angular modules

Have a near-term view of implementation and a long-term vision. Start small but keep in mind where the app is heading down the road.

All of the app's code goes in a folder named `src`.
All feature areas are in their own folder, with their own Angular module.

All content is one asset per file. Each component, service, and pipe is in its own file.
All third party vendor scripts are stored in another folder and not in the `src` folder.
You didn't write them and you don't want them cluttering `src`.
Use the naming conventions for files in this guide.
<a href="#toc">Back to top</a>

{@a 04-01}

### _LIFT_

#### Style 04-01


<div class="s-rule do">



**Do** structure the app such that you can **L**ocate code quickly,
**I**dentify the code at a glance,
keep the **F**lattest structure you can, and
**T**ry to be DRY.


</div>



<div class="s-rule do">



**Do** define the structure to follow these four basic guidelines, listed in order of importance.


</div>



<div class="s-why-last">



**Why?** LIFT Provides a consistent structure that scales well, is modular, and makes it easier to increase developer efficiency by finding code quickly.
To confirm your intuition about a particular structure, ask:
_can I quickly open and start work in all of the related files for this feature_?


</div>

<a href="#toc">Back to top</a>

{@a 04-02}

### Locate

#### Style 04-02


<div class="s-rule do">



**Do** make locating code intuitive, simple and fast.


</div>



<div class="s-why-last">



**Why?** To work efficiently you must be able to find files quickly,
especially when you do not know (or do not remember) the file _names_.
Keeping related files near each other in an intuitive location saves time.
A descriptive folder structure makes a world of difference to you and the people who come after you.


</div>

<a href="#toc">Back to top</a>

{@a 04-03}

### Identify

#### Style 04-03


<div class="s-rule do">



**Do** name the file such that you instantly know what it contains and represents.


</div>



<div class="s-rule do">



**Do** be descriptive with file names and keep the contents of the file to exactly one component.


</div>



<div class="s-rule avoid">



**Avoid** files with multiple components, multiple services, or a mixture.


</div>



<div class="s-why-last">



**Why?** Spend less time hunting and pecking for code, and become more efficient.
Longer file names are far better than _short-but-obscure_ abbreviated names.


</div>



<div class="l-sub-section">



It may be advantageous to deviate from the _one-thing-per-file_ rule when
you have a set of small, closely-related features that are better discovered and understood
in a single file than as multiple files. Be wary of this loophole.


</div>

<a href="#toc">Back to top</a>


{@a 04-04}

### Flat

#### Style 04-04

<div class="s-rule do">



**Do** keep a flat folder structure as long as possible.


</div>



<div class="s-rule consider">



**Consider** creating sub-folders when a folder reaches seven or more files.


</div>



<div class="s-rule consider">



**Consider** configuring the IDE to hide distracting, irrelevant files such as generated `.js` and `.js.map` files.


</div>



<div class="s-why-last">



**Why?** No one wants to search for a file through seven levels of folders.
A flat structure is easy to scan.

On the other hand,
<a href="https://en.wikipedia.org/wiki/The_Magical_Number_Seven,_Plus_or_Minus_Two">psychologists believe</a>
that humans start to struggle when the number of adjacent interesting things exceeds nine.
So when a folder has ten or more files, it may be time to create subfolders.

Base your decision on your comfort level.
Use a flatter structure until there is an obvious value to creating a new folder.


</div>

<a href="#toc">Back to top</a>


{@a 04-05}

### _T-DRY_ (Try to be _DRY_)

#### Style 04-05

<div class="s-rule do">



**Do** be DRY (Don't Repeat Yourself).


</div>



<div class="s-rule avoid">



**Avoid** being so DRY that you sacrifice readability.


</div>



<div class="s-why-last">



**Why?** Being DRY is important, but not crucial if it sacrifices the other elements of LIFT.
That's why it's called _T-DRY_.
For example, it's redundant to name a template `hero-view.component.html` because
with the `.html` extension, it is obviously a view.
But if something is not obvious or departs from a convention, then spell it out.


</div>

<a href="#toc">Back to top</a>


{@a 04-06}

### Overall structural guidelines

#### Style 04-06

<div class="s-rule do">



**Do** start small but keep in mind where the app is heading down the road.


</div>



<div class="s-rule do">



**Do** have a near term view of implementation and a long term vision.


</div>



<div class="s-rule do">



**Do** put all of the app's code in a folder named `src`.


</div>



<div class="s-rule consider">



**Consider** creating a folder for a component when it has multiple accompanying files (`.ts`, `.html`, `.css` and `.spec`).


</div>



<div class="s-why">



**Why?** Helps keep the app structure small and easy to maintain in the early stages, while being easy to evolve as the app grows.


</div>



<div class="s-why-last">



**Why?** Components often have four files (e.g. `*.html`, `*.css`, `*.ts`, and `*.spec.ts`) and can clutter a folder quickly.


</div>



{@a file-tree}


Here is a compliant folder and file structure:


<div class='filetree'>

  <div class='file'>
    &lt;project root&gt;
  </div>

  <div class='children'>

    <div class='file'>
      src
    </div>

    <div class='children'>

      <div class='file'>
        app
      </div>

      <div class='children'>

        <div class='file'>
          core
        </div>

        <div class='children'>

          <div class='file'>
            core.module.ts
          </div>

          <div class='file'>
            exception.service.ts|spec.ts
          </div>

          <div class='file'>
            user-profile.service.ts|spec.ts
          </div>

        </div>

        <div class='file'>
          heroes
        </div>

        <div class='children'>

          <div class='file'>
            hero
          </div>

          <div class='children'>

            <div class='file'>
              hero.component.ts|html|css|spec.ts
            </div>

          </div>

          <div class='file'>
            hero-list
          </div>

          <div class='children'>

            <div class='file'>
              hero-list.component.ts|html|css|spec.ts
            </div>

          </div>

          <div class='file'>
            shared
          </div>

          <div class='children'>

            <div class='file'>
              hero-button.component.ts|html|css|spec.ts
            </div>

            <div class='file'>
              hero.model.ts
            </div>

            <div class='file'>
              hero.service.ts|spec.ts
            </div>

          </div>

          <div class='file'>
            heroes.component.ts|html|css|spec.ts
          </div>

          <div class='file'>
            heroes.module.ts
          </div>

          <div class='file'>
            heroes-routing.module.ts
          </div>

        </div>

        <div class='file'>
          shared
        </div>

        <div class='children'>

          <div class='file'>
            shared.module.ts
          </div>

          <div class='file'>
            init-caps.pipe.ts|spec.ts
          </div>

          <div class='file'>
            text-filter.component.ts|spec.ts
          </div>

          <div class='file'>
            text-filter.service.ts|spec.ts
          </div>

        </div>

        <div class='file'>
          villains
        </div>

        <div class='children'>

          <div class='file'>
            villain
          </div>

          <div class='children'>

            <div class='file'>
              ...
            </div>

          </div>

          <div class='file'>
            villain-list
          </div>

          <div class='children'>

            <div class='file'>
              ...
            </div>

          </div>

          <div class='file'>
            shared
          </div>

          <div class='children'>

            <div class='file'>
              ...
            </div>

          </div>

          <div class='file'>
            villains.component.ts|html|css|spec.ts
          </div>

          <div class='file'>
            villains.module.ts
          </div>

          <div class='file'>
            villains-routing.module.ts
          </div>

        </div>

        <div class='file'>
          app.component.ts|html|css|spec.ts
        </div>

        <div class='file'>
          app.module.ts
        </div>

        <div class='file'>
          app-routing.module.ts
        </div>

      </div>

      <div class='file'>
        main.ts
      </div>

      <div class='file'>
        index.html
      </div>

      <div class='file'>
        ...
      </div>

    </div>

    <div class='file'>
      node_modules/...
    </div>

    <div class='file'>
      ...
    </div>

  </div>

</div>





<div class="l-sub-section">



While components in dedicated folders are widely preferred,
another option for small apps is to keep components flat (not in a dedicated folder).
This adds up to four files to the existing folder, but also reduces the folder nesting.
Whatever you choose, be consistent.


</div>

<a href="#toc">Back to top</a>

{@a 04-07}

### _Folders-by-feature_ structure

#### Style 04-07


<div class="s-rule do">



**Do** create folders named for the feature area they represent.


</div>



<div class="s-why">



**Why?** A developer can locate the code and identify what each file represents
at a glance. The structure is as flat as it can be and there are no repetitive or redundant names.


</div>



<div class="s-why">



**Why?** The LIFT guidelines are all covered.


</div>



<div class="s-why">



**Why?** Helps reduce the app from becoming cluttered through organizing the
content and keeping them aligned with the LIFT guidelines.


</div>



<div class="s-why">



**Why?** When there are a lot of files, for example 10+,
locating them is easier with a consistent folder structure
and more difficult in a flat structure.


</div>



<div class="s-rule do">



**Do** create an Angular module for each feature area.


</div>



<div class="s-why">



**Why?** Angular modules make it easy to lazy load routable features.


</div>



<div class="s-why-last">



**Why?** Angular modules make it easier to isolate, test, and re-use features.


</div>



<div class='file-tree-reference'>
  <a href="#file-tree">Refer to this _folder and file structure_ example.</a>
</div>

<a href="#toc">Back to top

</a>


{@a 04-08}

### App _root module_

#### Style 04-08

<div class="s-rule do">



**Do** create an Angular module in the app's root folder,
for example, in `/src/app`.


</div>



<div class="s-why">



**Why?** Every app requires at least one root Angular module.


</div>



<div class="s-rule consider">



**Consider** naming the root module `app.module.ts`.


</div>



<div class="s-why-last">



**Why?** Makes it easier to locate and identify the root module.


</div>



<code-example path="styleguide/src/04-08/app/app.module.ts" region="example" title="app/app.module.ts">

</code-example>



<a href="#toc">Back to top</a>


{@a 04-09}

### Feature modules

#### Style 04-09


<div class="s-rule do">



**Do** create an Angular module for all distinct features in an application;
for example, a `Heroes` feature.


</div>



<div class="s-rule do">



**Do** place the feature module in the same named folder as the feature area;
for example, in `app/heroes`.


</div>



<div class="s-rule do">



**Do** name the feature module file reflecting the name of the feature area
and folder; for example, `app/heroes/heroes.module.ts`.


</div>



<div class="s-rule do">



**Do** name the feature module symbol reflecting the name of the feature
area, folder, and file; for example, `app/heroes/heroes.module.ts` defines `HeroesModule`.


</div>



<div class="s-why">



**Why?** A feature module can expose or hide its implementation from other modules.


</div>



<div class="s-why">



**Why?** A feature module identifies distinct sets of related components that comprise the feature area.


</div>



<div class="s-why">



**Why?** A feature module can easily be routed to both eagerly and lazily.


</div>



<div class="s-why">



**Why?** A feature module defines clear boundaries between specific functionality and other application features.


</div>



<div class="s-why">



**Why?** A feature module helps clarify and make it easier to assign development responsibilities to different teams.


</div>



<div class="s-why-last">



**Why?** A feature module can easily be isolated for testing.


</div>

<a href="#toc">Back to top</a>

{@a 04-10}

### Shared feature module

#### Style 04-10


<div class="s-rule do">



**Do** create a feature module named `SharedModule` in a `shared` folder;
for example, `app/shared/shared.module.ts` defines `SharedModule`.


</div>



<div class="s-rule do">



**Do** declare components, directives, and pipes in a shared module when those
items will be re-used and referenced by the components declared in other feature modules.


</div>



<div class="s-rule consider">



**Consider** using the name SharedModule when the contents of a shared
module are referenced across the entire application.


</div>



<div class="s-rule avoid">



**Avoid** providing services in shared modules. Services are usually
singletons that are provided once for the entire application or
in a particular feature module.


</div>



<div class="s-rule do">



**Do** import all modules required by the assets in the `SharedModule`;
for example, `CommonModule` and `FormsModule`.


</div>



<div class="s-why">



**Why?** `SharedModule` will contain components, directives and pipes
that may need features from another common module; for example,
`ngFor` in `CommonModule`.


</div>



<div class="s-rule do">



**Do** declare all components, directives, and pipes in the `SharedModule`.


</div>



<div class="s-rule do">



**Do** export all symbols from the `SharedModule` that other feature modules need to use.


</div>



<div class="s-why">



**Why?** `SharedModule` exists to make commonly used components, directives and pipes available for use in the templates of components in many other modules.


</div>



<div class="s-rule avoid">



**Avoid** specifying app-wide singleton providers in a `SharedModule`. Intentional singletons are OK. Take care.


</div>



<div class="s-why">



**Why?** A lazy loaded feature module that imports that shared module will make its own copy of the service and likely have undesireable results.


</div>



<div class="s-why-last">



**Why?** You don't want each module to have its own separate instance of singleton services.
Yet there is a real danger of that happening if the `SharedModule` provides a service.


</div>



<div class='filetree'>

  <div class='file'>
    src
  </div>

  <div class='children'>

    <div class='file'>
      app
    </div>

    <div class='children'>

      <div class='file'>
        shared
      </div>

      <div class='children'>

        <div class='file'>
          shared.module.ts
        </div>

        <div class='file'>
          init-caps.pipe.ts|spec.ts
        </div>

        <div class='file'>
          text-filter.component.ts|spec.ts
        </div>

        <div class='file'>
          text-filter.service.ts|spec.ts
        </div>

      </div>

      <div class='file'>
        app.component.ts|html|css|spec.ts
      </div>

      <div class='file'>
        app.module.ts
      </div>

      <div class='file'>
        app-routing.module.ts
      </div>

    </div>

    <div class='file'>
      main.ts
    </div>

    <div class='file'>
      index.html
    </div>

  </div>

  <div class='file'>
    ...
  </div>

</div>





<code-tabs>

  <code-pane title="app/shared/shared.module.ts" path="styleguide/src/04-10/app/shared/shared.module.ts">

  </code-pane>

  <code-pane title="app/shared/init-caps.pipe.ts" path="styleguide/src/04-10/app/shared/init-caps.pipe.ts">

  </code-pane>

  <code-pane title="app/shared/filter-text/filter-text.component.ts" path="styleguide/src/04-10/app/shared/filter-text/filter-text.component.ts">

  </code-pane>

  <code-pane title="app/shared/filter-text/filter-text.service.ts" path="styleguide/src/04-10/app/shared/filter-text/filter-text.service.ts">

  </code-pane>

  <code-pane title="app/heroes/heroes.component.ts" path="styleguide/src/04-10/app/heroes/heroes.component.ts">

  </code-pane>

  <code-pane title="app/heroes/heroes.component.html" path="styleguide/src/04-10/app/heroes/heroes.component.html">

  </code-pane>

</code-tabs>



<a href="#toc">Back to top</a>

{@a 04-11}

### Core feature module

#### Style 04-11


<div class="s-rule consider">



**Consider** collecting numerous, auxiliary, single-use classes inside a core module
to simplify the apparent structure of a feature module.


</div>



<div class="s-rule consider">



**Consider** calling the application-wide core module, `CoreModule`.
Importing `CoreModule` into the root `AppModule` reduces its complexity
and emphasizes its role as orchestrator of the application as a whole.


</div>



<div class="s-rule do">



**Do** create a feature module named `CoreModule` in a `core` folder (e.g. `app/core/core.module.ts` defines `CoreModule`).


</div>



<div class="s-rule do">



**Do** put a singleton service whose instance will be shared throughout the application in the `CoreModule` (e.g. `ExceptionService` and `LoggerService`).


</div>



<div class="s-rule do">



**Do** import all modules required by the assets in the `CoreModule` (e.g. `CommonModule` and `FormsModule`).


</div>



<div class="s-why">



**Why?** `CoreModule` provides one or more singleton services. Angular registers the providers with the app root injector, making a singleton instance of each service available to any component that needs them, whether that component is eagerly or lazily loaded.


</div>



<div class="s-why">



**Why?** `CoreModule` will contain singleton services. When a lazy loaded module imports these, it will get a new instance and not the intended app-wide singleton.


</div>



<div class="s-rule do">



**Do** gather application-wide, single use components in the `CoreModule`.
Import it once (in the `AppModule`) when the app starts and never import it anywhere else. (e.g. `NavComponent` and `SpinnerComponent`).


</div>



<div class="s-why">



**Why?** Real world apps can have several single-use components (e.g., spinners, message toasts, and modal dialogs) that appear only in the `AppComponent` template.
They are not imported elsewhere so they're not shared in that sense.
Yet they're too big and messy to leave loose in the root folder.


</div>



<div class="s-rule avoid">



**Avoid** importing the `CoreModule` anywhere except in the `AppModule`.


</div>



<div class="s-why">



**Why?** A lazily loaded feature module that directly imports the `CoreModule` will make its own copy of services and likely have undesireable results.


</div>



<div class="s-why">



**Why?** An eagerly loaded feature module already has access to the `AppModule`'s injector, and thus the `CoreModule`'s services.


</div>



<div class="s-rule do">



**Do** export all symbols from the `CoreModule` that the `AppModule` will import and make available for other feature modules to use.


</div>



<div class="s-why">



**Why?** `CoreModule` exists to make commonly used singleton services available for use in the many other modules.


</div>



<div class="s-why-last">



**Why?** You want the entire app to use the one, singleton instance.
You don't want each module to have its own separate instance of singleton services.
Yet there is a real danger of that happening accidentally if the `CoreModule` provides a service.



</div>



<div class='filetree'>

  <div class='file'>
    src
  </div>

  <div class='children'>

    <div class='file'>
      app
    </div>

    <div class='children'>

      <div class='file'>
        core
      </div>

      <div class='children'>

        <div class='file'>
          core.module.ts
        </div>

        <div class='file'>
          logger.service.ts|spec.ts
        </div>

        <div class='file'>
          nav
        </div>

        <div class='children'>

          <div class='file'>
            nav.component.ts|html|css|spec.ts
          </div>

        </div>

        <div class='file'>
          spinner
        </div>

        <div class='children'>

          <div class='file'>
            spinner.component.ts|html|css|spec.ts
          </div>

          <div class='file'>
            spinner.service.ts|spec.ts
          </div>

        </div>

      </div>

      <div class='file'>
        app.component.ts|html|css|spec.ts
      </div>

      <div class='file'>
        app.module.ts
      </div>

      <div class='file'>
        app-routing.module.ts
      </div>

    </div>

    <div class='file'>
      main.ts
    </div>

    <div class='file'>
      index.html
    </div>

  </div>

  <div class='file'>
    ...
  </div>

</div>





<code-tabs>

  <code-pane title="app/app.module.ts" path="styleguide/src/04-11/app/app.module.ts" region="example">

  </code-pane>

  <code-pane title="app/core/core.module.ts" path="styleguide/src/04-11/app/core/core.module.ts">

  </code-pane>

  <code-pane title="app/core/logger.service.ts" path="styleguide/src/04-11/app/core/logger.service.ts">

  </code-pane>

  <code-pane title="app/core/nav/nav.component.ts" path="styleguide/src/04-11/app/core/nav/nav.component.ts">

  </code-pane>

  <code-pane title="app/core/nav/nav.component.html" path="styleguide/src/04-11/app/core/nav/nav.component.html">

  </code-pane>

  <code-pane title="app/core/spinner/spinner.component.ts" path="styleguide/src/04-11/app/core/spinner/spinner.component.ts">

  </code-pane>

  <code-pane title="app/core/spinner/spinner.component.html" path="styleguide/src/04-11/app/core/spinner/spinner.component.html">

  </code-pane>

  <code-pane title="app/core/spinner/spinner.service.ts" path="styleguide/src/04-11/app/core/spinner/spinner.service.ts">

  </code-pane>

</code-tabs>





<div class="l-sub-section">



`AppModule` is a little smaller because many app/root classes have moved to other modules.
`AppModule` is stable because you will add future components and providers to other modules, not this one.
`AppModule` delegates to imported modules rather than doing work.
`AppModule` is focused on its main task, orchestrating the app as a whole.


</div>

<a href="#toc">Back to top</a>

{@a 04-12}

### Prevent re-import of the core module

#### Style 04-12

Only the root `AppModule` should import the `CoreModule`.


<div class="s-rule do">



**Do** guard against reimporting of `CoreModule` and fail fast by adding guard logic.


</div>



<div class="s-why">



**Why?** Guards against reimporting of the `CoreModule`.


</div>



<div class="s-why-last">



**Why?** Guards against creating multiple instances of assets intended to be singletons.


</div>



<code-tabs>

  <code-pane title="app/core/module-import-guard.ts" path="styleguide/src/04-12/app/core/module-import-guard.ts">

  </code-pane>

  <code-pane title="app/core/core.module.ts" path="styleguide/src/04-12/app/core/core.module.ts">

  </code-pane>

</code-tabs>



<a href="#toc">Back to top</a>

{@a 04-13}

### Lazy Loaded folders

#### Style 04-13

A distinct application feature or workflow may be *lazy loaded* or *loaded on demand* rather than when the application starts.


<div class="s-rule do">



**Do** put the contents of lazy loaded features in a *lazy loaded folder*.
A typical *lazy loaded folder* contains a *routing component*, its child components, and their related assets and modules.


</div>



<div class="s-why-last">



**Why?** The folder makes it easy to identify and isolate the feature content.


</div>

<a href="#toc">Back to top</a>

{@a 04-14}

### Never directly import lazy loaded folders

#### Style 04-14


<div class="s-rule avoid">



**Avoid** allowing modules in sibling and parent folders to directly import a module in a *lazy loaded feature*.


</div>



<div class="s-why-last">



**Why?** Directly importing and using a module will load it immediately when the intention is to load it on demand.


</div>

<a href="#toc">Back to top</a>


## Components

{@a 05-02}

### Component selector names

#### Style 05-02


<div class="s-rule do">



**Do** use _dashed-case_ or _kebab-case_ for naming the element selectors of components.


</div>



<div class="s-why-last">



**Why?** Keeps the element names consistent with the specification for [Custom Elements](https://www.w3.org/TR/custom-elements/).


</div>



<code-example path="styleguide/src/05-02/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example" title="app/heroes/shared/hero-button/hero-button.component.ts">

</code-example>





<code-tabs>

  <code-pane title="app/heroes/shared/hero-button/hero-button.component.ts" path="styleguide/src/05-02/app/heroes/shared/hero-button/hero-button.component.ts" region="example">

  </code-pane>

  <code-pane title="app/app.component.html" path="styleguide/src/05-02/app/app.component.html">

  </code-pane>

</code-tabs>



<a href="#toc">Back to top</a>

{@a 05-03}

### Components as elements

#### Style 05-03


<div class="s-rule do">



**Do** give components an _element_ selector, as opposed to _attribute_ or _class_ selectors.


</div>



<div class="s-why">



**Why?** components have templates containing HTML and optional Angular template syntax.
They display content.
Developers place components on the page as they would native HTML elements and web components.


</div>



<div class="s-why-last">



**Why?** It is easier to recognize that a symbol is a component by looking at the template's html.


</div>



<code-example path="styleguide/src/05-03/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example" title="app/heroes/hero-button/hero-button.component.ts">

</code-example>





<code-example path="styleguide/src/05-03/app/app.component.avoid.html" title="app/app.component.html">

</code-example>





<code-tabs>

  <code-pane title="app/heroes/shared/hero-button/hero-button.component.ts" path="styleguide/src/05-03/app/heroes/shared/hero-button/hero-button.component.ts" region="example">

  </code-pane>

  <code-pane title="app/app.component.html" path="styleguide/src/05-03/app/app.component.html">

  </code-pane>

</code-tabs>



<a href="#toc">Back to top</a>

{@a 05-04}

### Extract templates and styles to their own files

#### Style 05-04


<div class="s-rule do">



**Do** extract templates and styles into a separate file, when more than 3 lines.


</div>



<div class="s-rule do">



**Do** name the template file `[component-name].component.html`, where [component-name] is the component name.


</div>



<div class="s-rule do">



**Do** name the style file `[component-name].component.css`, where [component-name] is the component name.


</div>



<div class="s-rule do">



**Do** specify _component-relative_ URLs, prefixed with `./`.


</div>



<div class="s-why">



**Why?** Large, inline templates and styles obscure the component's purpose and implementation, reducing readability and maintainability.


</div>



<div class="s-why">



**Why?** In most editors, syntax hints and code snippets aren't available when developing inline templates and styles.
The Angular TypeScript Language Service (forthcoming) promises to overcome this deficiency for HTML templates
in those editors that support it; it won't help with CSS styles.


</div>



<div class="s-why">



**Why?** A _component relative_ URL requires no change when you move the component files, as long as the files stay together.


</div>



<div class="s-why-last">



**Why?** The `./` prefix is standard syntax for relative URLs; don't depend on Angular's current ability to do without that prefix.



</div>



<code-example path="styleguide/src/05-04/app/heroes/heroes.component.avoid.ts" region="example" title="app/heroes/heroes.component.ts">

</code-example>





<code-tabs>

  <code-pane title="app/heroes/heroes.component.ts" path="styleguide/src/05-04/app/heroes/heroes.component.ts" region="example">

  </code-pane>

  <code-pane title="app/heroes/heroes.component.html" path="styleguide/src/05-04/app/heroes/heroes.component.html">

  </code-pane>

  <code-pane title="app/heroes/heroes.component.css" path="styleguide/src/05-04/app/heroes/heroes.component.css">

  </code-pane>

</code-tabs>



<a href="#toc">Back to top</a>

{@a 05-12}

### Decorate _input_ and _output_ properties

#### Style 05-12


<div class="s-rule do">



**Do** use the `@Input()` and `@Output()` class decorators instead of the `inputs` and `outputs` properties of the
`@Directive` and `@Component` metadata:


</div>



<div class="s-rule consider">



**Consider** placing `@Input()` or `@Output()` on the same line as the property it decorates.


</div>



<div class="s-why">



**Why?** It is easier and more readable to identify which properties in a class are inputs or outputs.


</div>



<div class="s-why">



**Why?** If you ever need to rename the property or event name associated with
`@Input` or `@Output`, you can modify it in a single place.


</div>



<div class="s-why">



**Why?** The metadata declaration attached to the directive is shorter and thus more readable.


</div>



<div class="s-why-last">



**Why?** Placing the decorator on the same line _usually_ makes for shorter code and still easily identifies the property as an input or output.
Put it on the line above when doing so is clearly more readable.


</div>



<code-example path="styleguide/src/05-12/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example" title="app/heroes/shared/hero-button/hero-button.component.ts">

</code-example>





<code-example path="styleguide/src/05-12/app/heroes/shared/hero-button/hero-button.component.ts" region="example" title="app/heroes/shared/hero-button/hero-button.component.ts">

</code-example>



<a href="#toc">Back to top</a>


{@a 05-13}

### Avoid aliasing _inputs_ and _outputs_

#### Style 05-13


<div class="s-rule avoid">



**Avoid** _input_ and _output_ aliases except when it serves an important purpose.


</div>



<div class="s-why">



**Why?** Two names for the same property (one private, one public) is inherently confusing.


</div>



<div class="s-why-last">



**Why?** You should use an alias when the directive name is also an _input_ property,
and the directive name doesn't describe the property.


</div>



<code-example path="styleguide/src/05-13/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example" title="app/heroes/shared/hero-button/hero-button.component.ts">

</code-example>





<code-example path="styleguide/src/05-13/app/app.component.avoid.html" title="app/app.component.html">

</code-example>





<code-tabs>

  <code-pane title="app/heroes/shared/hero-button/hero-button.component.ts" path="styleguide/src/05-13/app/heroes/shared/hero-button/hero-button.component.ts" region="example">

  </code-pane>

  <code-pane title="app/heroes/shared/hero-button/hero-highlight.directive.ts" path="styleguide/src/05-13/app/heroes/shared/hero-highlight.directive.ts">

  </code-pane>

  <code-pane title="app/app.component.html" path="styleguide/src/05-13/app/app.component.html">

  </code-pane>

</code-tabs>



<a href="#toc">Back to top</a>

{@a 05-14}

### Member sequence

#### Style 05-14


<div class="s-rule do">



**Do** place properties up top followed by methods.


</div>



<div class="s-rule do">



**Do** place private members after public members, alphabetized.


</div>



<div class="s-why-last">



**Why?** Placing members in a consistent sequence makes it easy to read and
helps instantly identify which members of the component serve which purpose.


</div>



<code-example path="styleguide/src/05-14/app/shared/toast/toast.component.avoid.ts" region="example" title="app/shared/toast/toast.component.ts">

</code-example>





<code-example path="styleguide/src/05-14/app/shared/toast/toast.component.ts" region="example" title="app/shared/toast/toast.component.ts">

</code-example>



<a href="#toc">Back to top</a>

{@a 05-15}

### Delegate complex component logic to services

#### Style 05-15


<div class="s-rule do">



**Do** limit logic in a component to only that required for the view. All other logic should be delegated to services.


</div>



<div class="s-rule do">



**Do** move reusable logic to services and keep components simple and focused on their intended purpose.


</div>



<div class="s-why">



**Why?** Logic may be reused by multiple components when placed within a service and exposed via a function.


</div>



<div class="s-why">



**Why?** Logic in a service can more easily be isolated in a unit test, while the calling logic in the component can be easily mocked.


</div>



<div class="s-why">



**Why?** Removes dependencies and hides implementation details from the component.


</div>



<div class="s-why-last">



**Why?** Keeps the component slim, trim, and focused.


</div>



<code-example path="styleguide/src/05-15/app/heroes/hero-list/hero-list.component.avoid.ts" title="app/heroes/hero-list/hero-list.component.ts">

</code-example>





<code-example path="styleguide/src/05-15/app/heroes/hero-list/hero-list.component.ts" region="example" title="app/heroes/hero-list/hero-list.component.ts">

</code-example>



<a href="#toc">Back to top</a>

{@a 05-16}

### Don't prefix _output_ properties

#### Style 05-16


<div class="s-rule do">



**Do** name events without the prefix `on`.


</div>



<div class="s-rule do">



**Do** name event handler methods with the prefix `on` followed by the event name.


</div>



<div class="s-why">



**Why?** This is consistent with built-in events such as button clicks.


</div>



<div class="s-why-last">



**Why?** Angular allows for an [alternative syntax](guide/template-syntax#binding-syntax) `on-*`. If the event itself was prefixed with `on` this would result in an `on-onEvent` binding expression.


</div>



<code-example path="styleguide/src/05-16/app/heroes/hero.component.avoid.ts" region="example" title="app/heroes/hero.component.ts">

</code-example>





<code-example path="styleguide/src/05-16/app/app.component.avoid.html" title="app/app.component.html">

</code-example>





<code-tabs>

  <code-pane title="app/heroes/hero.component.ts" path="styleguide/src/05-16/app/heroes/hero.component.ts" region="example">

  </code-pane>

  <code-pane title="app/app.component.html" path="styleguide/src/05-16/app/app.component.html">

  </code-pane>

</code-tabs>



<a href="#toc">Back to top</a>

{@a 05-17}

### Put presentation logic in the component class

#### Style 05-17


<div class="s-rule do">



**Do** put presentation logic in the component class, and not in the template.


</div>



<div class="s-why">



**Why?** Logic will be contained in one place (the component class) instead of being spread in two places.


</div>



<div class="s-why-last">



**Why?** Keeping the component's presentation logic in the class instead of the template improves testability, maintainability, and reusability.


</div>



<code-example path="styleguide/src/05-17/app/heroes/hero-list/hero-list.component.avoid.ts" region="example" title="app/heroes/hero-list/hero-list.component.ts">

</code-example>





<code-example path="styleguide/src/05-17/app/heroes/hero-list/hero-list.component.ts" region="example" title="app/heroes/hero-list/hero-list.component.ts">

</code-example>



<a href="#toc">Back to top</a>


## Directives

{@a 06-01}

### Use directives to enhance an element

#### Style 06-01


<div class="s-rule do">



**Do** use attribute directives when you have presentation logic without a template.


</div>



<div class="s-why">



**Why?** Attribute directives don't have an associated template.


</div>



<div class="s-why-last">



**Why?** An element may have more than one attribute directive applied.


</div>



<code-example path="styleguide/src/06-01/app/shared/highlight.directive.ts" region="example" title="app/shared/highlight.directive.ts">

</code-example>





<code-example path="styleguide/src/06-01/app/app.component.html" title="app/app.component.html">

</code-example>



<a href="#toc">Back to top</a>

{@a 06-03}

### _HostListener_/_HostBinding_ decorators versus _host_ metadata

#### Style 06-03


<div class="s-rule consider">



**Consider** preferring the `@HostListener` and `@HostBinding` to the
`host` property of the `@Directive` and `@Component` decorators.


</div>



<div class="s-rule do">



**Do** be consistent in your choice.


</div>



<div class="s-why-last">



**Why?** The property associated with `@HostBinding` or the method associated with `@HostListener`
can be modified only in a single place&mdash;in the directive's class.
If you use the `host` metadata property, you must modify both the property declaration inside the controller,
and the metadata associated with the directive.


</div>



<code-example path="styleguide/src/06-03/app/shared/validator.directive.ts" title="app/shared/validator.directive.ts">

</code-example>



Compare with the less preferred `host` metadata alternative.


<div class="s-why-last">



**Why?** The `host` metadata is only one term to remember and doesn't require extra ES imports.


</div>



<code-example path="styleguide/src/06-03/app/shared/validator2.directive.ts" title="app/shared/validator2.directive.ts">

</code-example>



<a href="#toc">Back to top</a>


## Services

{@a 07-01}

### Services are singletons

#### Style 07-01


<div class="s-rule do">



**Do** use services as singletons within the same injector. Use them for sharing data and functionality.


</div>



<div class="s-why">



**Why?** Services are ideal for sharing methods across a feature area or an app.


</div>



<div class="s-why-last">



**Why?** Services are ideal for sharing stateful in-memory data.


</div>



<code-example path="styleguide/src/07-01/app/heroes/shared/hero.service.ts" region="example" title="app/heroes/shared/hero.service.ts">

</code-example>



<a href="#toc">Back to top</a>

{@a 07-02}

### Single responsibility

#### Style 07-02


<div class="s-rule do">



**Do** create services with a single responsibility that is encapsulated by its context.


</div>



<div class="s-rule do">



**Do** create a new service once the service begins to exceed that singular purpose.


</div>



<div class="s-why">



**Why?** When a service has multiple responsibilities, it becomes difficult to test.


</div>



<div class="s-why-last">



**Why?** When a service has multiple responsibilities, every component or service that injects it now carries the weight of them all.


</div>

<a href="#toc">Back to top</a>

{@a 07-03}

### Providing a service

#### Style 07-03


<div class="s-rule do">



**Do** provide services to the Angular injector at the top-most component where they will be shared.


</div>



<div class="s-why">



**Why?** The Angular injector is hierarchical.


</div>



<div class="s-why">



**Why?** When providing the service to a top level component,
that instance is shared and available to all child components of that top level component.


</div>



<div class="s-why">



**Why?** This is ideal when a service is sharing methods or state.


</div>



<div class="s-why-last">



**Why?** This is not ideal when two different components need different instances of a service. In this scenario it would be better to provide the service at the component level that needs the new and separate instance.


</div>



<code-tabs>

  <code-pane title="app/app.component.ts" path="styleguide/src/07-03/app/app.component.ts">

  </code-pane>

  <code-pane title="app/heroes/hero-list/hero-list.component.ts" path="styleguide/src/07-03/app/heroes/hero-list/hero-list.component.ts">

  </code-pane>

</code-tabs>



<a href="#toc">Back to top</a>

{@a 07-04}

### Use the @Injectable() class decorator

#### Style 07-04


<div class="s-rule do">



**Do** use the `@Injectable()` class decorator instead of the `@Inject` parameter decorator when using types as tokens for the dependencies of a service.


</div>



<div class="s-why">



**Why?** The Angular Dependency Injection (DI) mechanism resolves a service's own
dependencies based on the declared types of that service's constructor parameters.


</div>



<div class="s-why-last">



**Why?** When a service accepts only dependencies associated with type tokens, the `@Injectable()` syntax is much less verbose compared to using `@Inject()` on each individual constructor parameter.


</div>



<code-example path="styleguide/src/07-04/app/heroes/shared/hero-arena.service.avoid.ts" region="example" title="app/heroes/shared/hero-arena.service.ts">

</code-example>





<code-example path="styleguide/src/07-04/app/heroes/shared/hero-arena.service.ts" region="example" title="app/heroes/shared/hero-arena.service.ts">

</code-example>



<a href="#toc">Back to top</a>


## Data Services

{@a 08-01}

### Talk to the server through a service

#### Style 08-01


<div class="s-rule do">



**Do** refactor logic for making data operations and interacting with data to a service.


</div>



<div class="s-rule do">



**Do** make data services responsible for XHR calls, local storage, stashing in memory, or any other data operations.


</div>



<div class="s-why">



**Why?** The component's responsibility is for the presentation and gathering of information for the view. It should not care how it gets the data, just that it knows who to ask for it. Separating the data services moves the logic on how to get it to the data service, and lets the component be simpler and more focused on the view.


</div>



<div class="s-why">



**Why?** This makes it easier to test (mock or real) the data calls when testing a component that uses a data service.


</div>



<div class="s-why-last">



**Why?** The details of data management, such as headers, HTTP methods,
caching, error handling, and retry logic, are irrelevant to components
and other data consumers.

A data service encapsulates these details. It's easier to evolve these
details inside the service without affecting its consumers. And it's
easier to test the consumers with mock service implementations.


</div>

<a href="#toc">Back to top</a>


## Lifecycle hooks

Use Lifecycle hooks to tap into important events exposed by Angular.

<a href="#toc">Back to top</a>

{@a 09-01}

### Implement lifecycle hook interfaces

#### Style 09-01


<div class="s-rule do">



**Do** implement the lifecycle hook interfaces.


</div>



<div class="s-why-last">



**Why?** Lifecycle interfaces prescribe typed method
signatures. use those signatures to flag spelling and syntax mistakes.


</div>



<code-example path="styleguide/src/09-01/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example" title="app/heroes/shared/hero-button/hero-button.component.ts">

</code-example>





<code-example path="styleguide/src/09-01/app/heroes/shared/hero-button/hero-button.component.ts" region="example" title="app/heroes/shared/hero-button/hero-button.component.ts">

</code-example>



<a href="#toc">Back to top</a>


## Appendix

Useful tools and tips for Angular.

<a href="#toc">Back to top</a>

{@a A-01}

### Codelyzer

#### Style A-01


<div class="s-rule do">



**Do** use [codelyzer](https://www.npmjs.com/package/codelyzer) to follow this guide.


</div>



<div class="s-rule consider">



**Consider** adjusting the rules in codelyzer to suit your needs.


</div>

<a href="#toc">Back to top</a>

{@a A-02}

### File templates and snippets

#### Style A-02


<div class="s-rule do">



**Do** use file templates or snippets to help follow consistent styles and patterns. Here are templates and/or snippets for some of the web development editors and IDEs.


</div>



<div class="s-rule consider">



**Consider** using [snippets](https://marketplace.visualstudio.com/items?itemName=johnpapa.Angular2) for [Visual Studio Code](https://code.visualstudio.com/) that follow these styles and guidelines.

<a href="https://marketplace.visualstudio.com/items?itemName=johnpapa.Angular2">
  <img src="generated/images/guide/styleguide/use-extension.gif" alt="Use Extension">
</a>

**Consider** using [snippets](https://atom.io/packages/angular-2-typescript-snippets) for [Atom](https://atom.io/) that follow these styles and guidelines.

**Consider** using [snippets](https://github.com/orizens/sublime-angular2-snippets) for [Sublime Text](http://www.sublimetext.com/) that follow these styles and guidelines.

**Consider** using [snippets](https://github.com/mhartington/vim-angular2-snippets) for [Vim](http://www.vim.org/) that follow these styles and guidelines.


</div>

<a href="#toc">Back to top</a>
