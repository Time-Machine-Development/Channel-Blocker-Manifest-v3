//generates the SVG of a block-btn
function createBlockBtnSVG() {
    let svgURI = "http://www.w3.org/2000/svg";
    let svg = document.createElementNS(svgURI, "svg");

    svg.setAttribute("viewBox", "0 0 100 100");

    let path = document.createElementNS(svgURI, "path");
    path.setAttribute("d", "M 10,10 L 90,90 M 90,10 L 10,90");
    path.setAttribute("style", "fill: transparent;stroke-linecap: round;stroke-width: 20;");

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
    if (buttonVisible) {
        style.sheet.insertRule(`
            .cb_block_button {
                background-color: Transparent;
                border: none;
                stroke: ${buttonColor};
                cursor: pointer;
                margin: 0 0.5rem 0 0;
                padding: 0;
            }
        `);
        style.sheet.insertRule(`
            *:has(> .cb_block_button) { 
                display: flex !important;
                align-items: center !important;
                flex-direction: row !important;
                flex-wrap: nowrap !important;
            }
        `);
        style.sheet.insertRule(`
            .cb_block_button + * { 
                overflow: hidden;
            }
        `);
    } else {
        style.sheet.insertRule(`
            .cb_block_button {
                display: none;
            }
        `);
    }

    style.sheet.insertRule(`
		.cb_block_button svg{
			display: block;
            width: ${buttonSize * 0.1 - 2}px;
		}
	`);
    style.sheet.insertRule(`
        #items.blocked,
		.blocked {
			display: none !important;
		}
	`);
}
