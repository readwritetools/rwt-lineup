//=============================================================================
//
// File:         /node_modules/rwt-lineup/rwt-lineup.js
// Language:     ECMAScript 2015
// Copyright:    Read Write Tools © 2020
// License:      MIT
// Initial date: Jan 5, 2020
// Contents:     A flexible menu using round images as hyperlinks
//
//=============================================================================

export default class RwtLineup extends HTMLElement {

	// The elementInstance is used to distinguish between multiple instances of this custom element
	static elementInstance = 0;

	constructor() {
		super();
		
		// child elements
		this.clipframe = null;
		this.container = null;
		this.pullbar = null;
		
		// properties
		this.shortcutKey = null;
		this.collapseSender = `RwtLineup ${RwtLineup.elementInstance}`;
		this.numAnchors = 0;
		this.firstAnchorSize = 64;
		
		// highlight this document's menu item
		this.activeElement = null;
		this.thisURL = '';
		
		Object.seal(this);
	}
	
	//-------------------------------------------------------------------------
	// customElement life cycle callbacks
	//-------------------------------------------------------------------------
	async connectedCallback() {		
		// guard against possible call after this has been disconnected
		if (!this.isConnected)
			return;
		
		var htmlFragment = await this.fetchTemplate();
		if (htmlFragment == null)
			return;
		
		var styleElement = await this.fetchCSS();
		if (styleElement == null)
			return;

		var menuElement = await this.fetchMenu();
		if (menuElement != null) {
			var elContainer = htmlFragment.getElementById('container');
			elContainer.appendChild(menuElement);
		}
		
		// append the HTML and CSS to the custom element's shadow root
		this.attachShadow({mode: 'open'});
		this.shadowRoot.appendChild(htmlFragment); 
		this.shadowRoot.appendChild(styleElement); 
		
		this.identifyChildren();
		this.discoverAnchorMetrics();
		this.registerEventListeners();
		this.initializeShortcutKey();
		this.highlightActiveElement();
		this.pulsate();
	}
	
	//-------------------------------------------------------------------------
	// initialization
	//-------------------------------------------------------------------------

	//^ Fetch the user-specified menu items from the file specified in
	//  the custom element's sourceref attribute, which is a URL.
	//
	//  That file should contain HTML with hyperlinked images items like this:
	//    <a href='/path/to/page1.html' tabindex=301 <img src='/img/page1.jpg' title='Page 1' \></a>
	//    <a href='/path/to/page1.html' tabindex=301 <img src='/img/page1.jpg' title='Page 1' \></a>
	//    <a href='/path/to/page1.html' tabindex=301 <img src='/img/page1.jpg' title='Page 1' \></a>
	//
	//< returns a document-fragment suitable for appending to the container element
	//< returns null if the user has not specified a sourceref attribute or
	//  if the server does not respond with 200 or 304
	async fetchMenu() {
		if (this.hasAttribute('sourceref') == false)
			return null;
		
		var sourceref = this.getAttribute('sourceref');

		var response = await fetch(sourceref, {cache: "no-cache"});		// send conditional request to server with ETag and If-None-Match
		if (response.status != 200 && response.status != 304)
			return null;
		var templateText = await response.text();
		
		// create a template and turn its content into a document fragment
		var template = document.createElement('template');
		template.innerHTML = templateText;
		return template.content;
	}

	//^ Fetch the HTML template
	//< returns a document-fragment suitable for appending to shadowRoot
	//< returns null if server does not respond with 200 or 304
	async fetchTemplate() {
		var response = await fetch('/node_modules/rwt-lineup/rwt-lineup.blue', {cache: "no-cache"});
		if (response.status != 200 && response.status != 304)
			return null;
		var templateText = await response.text();
		
		// create a template and turn its content into a document fragment
		var template = document.createElement('template');
		template.innerHTML = templateText;
		return template.content;
	}
	
	//^ Fetch the CSS styles and turn it into a style element
	//< returns an style element suitable for appending to shadowRoot
	//< returns null if server does not respond with 200 or 304
	async fetchCSS() {
		var response = await fetch('/node_modules/rwt-lineup/rwt-lineup.css', {cache: "no-cache"});
		if (response.status != 200 && response.status != 304)
			return null;
		var css = await response.text();

		var styleElement = document.createElement('style');
		styleElement.innerHTML = css;
		return styleElement;
	}
	
	//^ Identify this component's children
	identifyChildren() {
		this.clipframe = this.shadowRoot.getElementById('clipframe');
		this.container = this.shadowRoot.getElementById('container');
		this.pullbar = this.shadowRoot.getElementById('pullbar');
	}		
	
	//^ assume that all anchors are the same width, as determined from the first one
	discoverAnchorMetrics() {
		// first look to see how many anchors are in the user-specified template
		var templatedAnchors = this.shadowRoot.querySelectorAll('#container a');
		if (templatedAnchors.length > 0)
			this.firstAnchorSize = templatedAnchors.item(0).offsetWidth;
		
		// now look to see how many anchors were slotted in
		var slottedAnchors = this.querySelectorAll('a');
		if (slottedAnchors.length > 0)
			this.firstAnchorSize = slottedAnchors.item(0).offsetWidth;
		
		this.numAnchors = templatedAnchors.length + slottedAnchors.length;
	}
	
	registerEventListeners() {
		// window events
		window.addEventListener('resize', this.onResizeWindow.bind(this));

		// document events
		document.addEventListener('click', this.onClickDocument.bind(this));
		document.addEventListener('keydown', this.onKeydownDocument.bind(this));
		document.addEventListener('collapse-popup', this.onCollapsePopup.bind(this));
		document.addEventListener('toggle-lineup', this.onToggleEvent.bind(this));
		
		// component events
		this.container.addEventListener('click', this.onClickContainer.bind(this));
		this.pullbar.addEventListener('click', this.onClickPullbar.bind(this));
	}

	//^ Get the user-specified shortcut key. This will be used to open the dialog.
	//  Valid values are "F1", "F2", etc., specified with the *shortcut attribute on the custom element
	//  Default value is "F10"
	initializeShortcutKey() {
		if (this.hasAttribute('shortcut'))
			this.shortcutKey = this.getAttribute('shortcut');
		else
			this.shortcutKey = 'F10';
	}

	//^ Highlight the anchor image corresponding to this document
	//
	//  For this to work, the document should have a tag like this in its <head>
	//    <meta name='lineup:this-url' content='/file1.blue' />
	//
	highlightActiveElement() {
		// the document must self-identify its own URL
		var meta = document.querySelector('meta[name="lineup:this-url"]')
		if (meta != null) {
			this.thisURL = meta.getAttribute('content');
			if (this.thisURL == null)
				this.thisURL = '';
		}
		
		// find the corresponding anchor tag
		if (this.thisURL != '') {
			var selector = `a[href='${this.thisURL}']`;	
			this.activeElement = this.container.querySelector(selector);				//  for elements added to shadow DOM
			if (this.activeElement == null)
				this.activeElement = this.querySelector(selector);						//  for elements added as slot
		}
		if (this.activeElement) {
			this.activeElement.scrollIntoView({block:'center'});
			this.activeElement.classList.add('activename');								//  use CSS to highlight the element
		}
	}

	// draw attention to the pull-out nav for newcomers
	pulsate() {
		var b = false;
		// if the user has never been to this website before
		if (localStorage.getItem('rwt-lineup-pulsate') == null) {
			localStorage.setItem('rwt-lineup-pulsate', 1);
			b = true;
		}
		// else the user has been to this website before
		else {
			var numVisits = parseInt(localStorage.getItem('rwt-lineup-pulsate')) + 1;
			localStorage.setItem('rwt-lineup-pulsate', numVisits);
			if (numVisits <= 4)
				b = true;
		}
		if (b)
			this.pullbar.classList.add('pulsate');
	}
	
	//-------------------------------------------------------------------------
	// window events
	//-------------------------------------------------------------------------
	
	onResizeWindow() {
		this.resizeContainer();
	}
	
	//-------------------------------------------------------------------------
	// document events
	//-------------------------------------------------------------------------
	
	// User has clicked on the document
	onClickDocument(event) {
		this.hideMenu();
		event.stopPropagation();
	}

	// close the dialog when user presses the ESC key
	// toggle the dialog when user presses the assigned shortcutKey
	onKeydownDocument(event) {		
		if (event.key == "Escape") {
			this.hideMenu();
			event.stopPropagation();
		}
		// like 'F1', 'F2', etc
		if (event.key == this.shortcutKey) {
			this.toggleMenu(event);
			event.stopPropagation();
			event.preventDefault();
		}
	}

	//^ Send an event to close/hide all other registered popups
	collapseOtherPopups() {
		var collapseSender = this.collapseSender;
		var collapseEvent = new CustomEvent('collapse-popup', {detail: { collapseSender }});
		document.dispatchEvent(collapseEvent);
	}
	
	//^ Listen for an event on the document instructing this component to close/hide
	//  But don't collapse this component, if it was the one that generated it
	onCollapsePopup(event) {
		if (event.detail.sender == this.collapseSender)
			return;
		else
			this.hideMenu();
	}
	
	//^ Anybody can use: document.dispatchEvent(new Event('toggle-lineup'));
	// to open/close this component.
	onToggleEvent(event) {
		event.stopPropagation();
		this.toggleMenu(event);
	}
	
	//-------------------------------------------------------------------------
	// component events
	//-------------------------------------------------------------------------

	// User has clicked in the container panel, but not on a button
	onClickContainer(event) {
		event.stopPropagation();
	}

	onClickPullbar(event) {
		this.toggleMenu(event);
	}
	
	//-------------------------------------------------------------------------
	// component methods
	//-------------------------------------------------------------------------
	
	// open/close
	toggleMenu(event) {
		if (this.container.classList.contains('expand'))
			this.hideMenu();
		else
			this.showMenu();
		event.stopPropagation();
	}

	showMenu() {
		this.collapseOtherPopups();
		this.container.classList.add('expand');
		this.resizeContainer();
		if (this.activeElement != null)
			this.activeElement.focus();
	}

	hideMenu() {
		this.container.classList.remove('expand');
		this.container.style.height = 'var(--container-height)';
	}
	
	// This is called by both showMenu() and onResizeWindow()
	resizeContainer() {
		if (this.container.classList.contains('expand')) {
			var buttonsPerRow = Math.floor(this.clipframe.offsetWidth / this.firstAnchorSize);
			var numRows = Math.ceil(this.numAnchors / buttonsPerRow);
			var containerHeight = numRows * this.firstAnchorSize;
			this.container.style.height = `${containerHeight}px`;
		}
	}
}

window.customElements.define('rwt-lineup', RwtLineup);
