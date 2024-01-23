//generates the SVG of a block-btn
function createBlockBtnSVG() {
    let svgURI = "http://www.w3.org/2000/svg";
    let svg = document.createElementNS(svgURI, "svg");

    svg.setAttribute("viewBox", "0 0 100 100");

    let path = document.createElementNS(svgURI, "path");
    path.setAttribute("d", "M 15,15 L 85,85 M 85,15 L 15,85");
    path.setAttribute("style", "fill: transparent;stroke-linecap: round;stroke-width: 25;");

    svg.appendChild(path);

    return svg;
}

//creates and returns a block-button and applies (optionally) passed style options style which blocks user/channel-name userChannelName which clicked
function createBlockBtnElement(userChannelName: string) {
    let btn = document.createElement("button");
    btn.setAttribute("class", "cb_block_button");
    btn.setAttribute("type", "button");
    btn.setAttribute("title", "Block '" + userChannelName + "' (Channel Blocker)");

    btn.appendChild(createBlockBtnSVG());

    return btn;
}

//adds a new Element with id "cb_style" and updates CSS depending on contentUIConfig (defined in config.js)
function initBlockBtnCSS() {
    //if cb_style Element does not already exist add it to the head
    if (document.getElementById("cb_style") === null) {
        let style = document.createElement("style");
        style.id = "cb_style";
        document.head.appendChild(style);
    }

    //set new css rules
    updateBlockBtnCSS();
}

//updates CSS depending on contentUIConfig (defined in config.js)
function updateBlockBtnCSS() {
    //get the cb_style element
    let style = document.getElementById("cb_style") as HTMLStyleElement;

    if (style.sheet === null) return;

    //remove all old rules
    while (style.sheet.cssRules.length > 0) {
        style.sheet.deleteRule(0);
    }

    //define width, strokeColor and display depending on contentUIConfig (defined in config.js)

    //add the new rules
    style.sheet.insertRule(`
		.cb_block_button {
			padding-left: 0em;
			padding-right: 0.5rem;
			border: none;
			background-color: Transparent;
			cursor: pointer;
			width: 1.56rem;
			stroke: rgb(113, 113, 113);
			display: inline-flex;
			flex-shrink: 0;
			justify-content: center;
    		align-items: center;
		}
	`);

    style.sheet.insertRule(`
		.cb_block_button svg{
			display: block;
		}
	`);

    style.sheet.insertRule(`
		.blocked {
			display: none;
		}
	`);
}
