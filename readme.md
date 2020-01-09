







<figure>
	<img src='/img/components/lineup/rwt-lineup.png' width='100%' />
	<figcaption></figcaption>
</figure>

# The Line Up

## All the usual suspects


<address>
<img src='/img/rwtools.png' width=80 /> by <a href='https://readwritetools.com' title='Read Write Tools'>Read Write Tools</a> <time datetime=2020-01-05>Jan 5, 2020</time></address>



<table>
	<tr><th>Abstract</th></tr>
	<tr><td>The <span class=product>rwt-lineup</span> web component is a flexible menu using round images as hyperlinks, with a pullbar to expand items that have overflowed its single-line container.</td></tr>
</table>

### Motivation

Sometimes a visual menu is better than a textual menu.

The <span>rwt-lineup</span> web component applies circular styling to
square images, providing a fully iconic interface. For situations where there
are too many hyperlinks to fit in a single line, the extras are kept hidden
until activated by the user, using either the visual pullbar or the component's `toggleMenu`
method or through its event interface.

This component is a light-hearted take on "The Line Up" of "all the usual
suspects". It's designed for use in a website's top banner area.

The component has these features:

   * A single line of icons is displayed in the container's collapsed state. The full
      set of icons is display in the expanded state, accommodating any number of menu
      items.
   * The menu item corresponding to the current page is highlighted and scrolled into
      view when the page is loaded.
   * The menu has an event interface for expanding and collapsing itself.
   * The menu emits a custom event to close sibling menus and dialog boxes.
   * Menu items may be kept separate from the web component, allowing the webmaster
      to change its contents in a single centralized place. Alternatively, menu items
      may be slotted directly between the component's opening and closing tags.
   * A keyboard listener is provided to allow a shortcut key to expand/collapse the
      menu.
   * A half-height pullbar for expanding the container is displayed along the bottom
      margin, appearing larger on hover.
   * The first few times that a visitor interacts with your website, the pullbar
      pulses to draw attention to itself.

#### Prerequisites

The <span>rwt-lineup</span> web component works in any browser that
supports modern W3C standards. It has no other prerequisites. Distribution and
installation are done with either NPM or via Github.

#### Installation using NPM

If you are familiar with Node.js and the `package.json` file, you'll be
comfortable installing the component just using this command:

```bash
npm install rwt-lineup
```

If you are a front-end Web developer with no prior experience with NPM, follow
these general steps:

   * Install <a href='https://nodejs.org'>Node.js/NPM</a>
on your development computer.
   * Create a `package.json` file in the root of your web project using the command:
```bash
npm init
```

   * Download and install the web component using the command:
```bash
npm install rwt-lineup
```


Important note: This web component uses Node.js and NPM and `package.json` as a
convenient *distribution and installation* mechanism. The web component itself
does not need them.

#### Installation using Github

If you are more comfortable using Github for installation, follow these steps:

   * Create a directory `node_modules` in the root of your web project.
   * Clone the <span>rwt-lineup</span> web component into it using the command:
```bash
git clone https://github.com/readwritetools/rwt-lineup.git
```


### Using the web component

After installation, you need to add two things to your HTML page to make use of
it.

   * Add a `script` tag to load the component's `rwt-lineup.js` file:
```html
<script src='/node_modules/rwt-lineup/rwt-lineup.js' type=module></script>             
```

   * Add the component tag somewhere on the page.

      * For scripting purposes, apply an `id` attribute.
      * Apply a `sourceref` attribute with a reference to an HTML file containing the
         menu's hyperlinks.
      * Optionally, apply a `shortcut` attribute with something like `F9`, `F10`, etc. for
         hotkey access.
      * For WAI-ARIA accessibility apply a `role=navigation` attribute.
      * For simple menus, the `sourceref` may be omitted and the menu hyperlinks may be
         slotted into the web component. Simply place the hyperlinks directly between the
`<rwt-lineup>` and `</rwt-lineup>` tags.
      * Here's an example HTML tag where the menu items are in a separate file:
```html
<rwt-lineup id=lineup sourceref='/menu.html' shortcut=F10 role=navigation></rwt-lineup>
```


#### Menu template

The content and format of the menu items should follow this pattern, which uses
anchors `<a>` that enclose images `<img>`.

```html
<a href='/path/to/page1.html' tabindex=301 <img src='/img/page1.jpg' title='Page 1' ></a>
<a href='/path/to/page2.html' tabindex=301 <img src='/img/page2.jpg' title='Page 2' ></a>
<a href='/path/to/page3.html' tabindex=301 <img src='/img/page3.jpg' title='Page 3' ></a>
```

#### Self identification

The menu item corresponding to the current page can be highlighted when it
identifies itself to the menu. This is accomplished by adding a `meta` tag to the
page that contains the short-form URL of the page itself. For example, if the
page's full URL is `https://example.com:443/services.html` the shortform URL would
be `/services.html`.

The short-form URL should be added to a special-purpose `meta` tag, like this:

```html
<meta name='lineup:this-url' content='/services.html' />
```

### Customization

#### Menu item size and spacing

The images that you provide should be square. They will be resized using the
value you specify with the CSS `--img-size` variable. Spacing between the icons
can be adjusted with the `--img-margin` variable.

The height of the pullbar can be made more or less prominent by setting the `--pullbar-height`
variable.

The `--width` variable can be used to shorten the width of the component's inner
container.

```css
rwt-lineup {
    --img-size: 64px;
    --img-margin: 16px;
    --width: 100%;
    --pullbar-height: 1rem;
}
```

#### Menu color scheme

The default color palette for the menu uses a dark mode theme. You can use CSS
to override the variables' defaults:

```css
rwt-lineup {
    --color: var(--pure-white);
    --accent-color1: var(--title-blue);
    --accent-color2: var(--yellow);
    --accent-color3: var(--dark-gray);
    --background: var(--transparent-black);
    --accent-background1: var(--light-black);
    --accent-background2: var(--pure-black);
}
```

### Event interface

The menu can be controlled with its event interface.

The component listens on DOM `document` for `toggle-lineup` messages. Upon receipt
it will expand or collapse the menu.

The component listens on DOM `document` for `keydown` messages. If the user presses
the configured shortcut key (<kbd>F9</kbd>, <kbd>F10</kbd>, etc) it will
collapse/expand the menu. The <kbd>Esc</kbd> key collapses the menu.

The component listens on DOM `document` for `collapse-popup` messages, which are
sent by sibling menus or dialog boxes. Upon receipt it will collapse itself.

The component listens on DOM `document` for `click` messages. When the user clicks
anywhere outside the menu, it collapses itself.

### License

The <span>rwt-lineup</span> web component is licensed under the MIT
License.

<img src='/img/blue-seal-mit.png' width=80 align=right />

<details>
	<summary>MIT License</summary>
	<p>Copyright © 2020 Read Write Tools.</p>
	<p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>
	<p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>
	<p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
</details>

### Availability


<table>
	<tr><td>Source code</td> 			<td><a href='https://github.com/readwritetools/rwt-lineup'>github</a></td></tr>
	<tr><td>Package installation</td> <td><a href='https://www.npmjs.com/package/rwt-lineup'>NPM</a></td></tr>
	<tr><td>Documentation</td> 		<td><a href='https://hub.readwritetools.com/components/lineup.blue'>Read Write Hub</a></td></tr>
</table>

