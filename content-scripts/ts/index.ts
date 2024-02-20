initBlockBtnCSS();

function loadContext() {
    const context = getYTContext();
    handleContextChange(context);
}

addTitleChangeObserver(loadContext);

loadContext();
