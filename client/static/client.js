function ShowHide() {
    const elementPane = document.querySelector('.lateralPane');
    var menu = getComputedStyle(elementPane).visibility;

    const elementContainer = document.querySelector('.pageContainer');

    if (menu === "visible") {
        elementPane.style.visibility="hidden";
        elementContainer.style.width="100%";
    }
    else if (menu === "hidden") {
        elementPane.style.visibility="visible";
        elementContainer.style.width="80%";
        document.getElementById('container').style.width="80%";
    }
}

function insertDate(date) {
    var articleDate = document.createElement('p');
    articleDate.innerHTML = date;
    articleDate.setAttribute('class','dateArticle');
    document.getElementsByTagName('P')[0].after(articleDate);
}

function removeAuthorName() {
    document.getElementsByName('thumb').forEach(function (element) {
        if (element.getElementsByTagName('p').length > 1) {
            element.removeChild(element.getElementsByTagName('p').item(1));
        }
    });
}

function removeHTMLBalises() {
    document.getElementsByName('thumb').forEach(function (element) {
        element.innerText.replace(/(<([^>]+)>)/gi, "").replace(/<\/b>/g, "");
    });
}

function insertSocialNetwork(elementId) {
    var divSocialNetwork = document.createElement('div');
    divSocialNetwork.setAttribute('class','divSocialNetwork');
    divSocialNetwork.setAttribute('align','right');

    var spacerSocialNetwork = document.createElement('br');

    var linkedinImg = document.createElement('img');
    linkedinImg.setAttribute('src', 'http://mehari-consulting.com/public/img/icons/linkedin.png');
    linkedinImg.setAttribute('align', 'right');
    linkedinImg.setAttribute('height', '20px');
    linkedinImg.setAttribute('width', 'auto');
    linkedinImg.setAttribute('onclick', 'window.open("https://www.linkedin.com/sharing/share-offsite/?url='+
    "http://mehari-consulting.com/"+elementId+'")');
    divSocialNetwork.appendChild(linkedinImg);

/*    var copyImg = document.createElement('img');
    copyImg.setAttribute('src', 'http://mehari-consulting.com/public/img/icons/copy.png');
    copyImg.setAttribute('height', '20px');
    copyImg.setAttribute('width', 'auto');
    copyImg.setAttribute('id','copyImg');
    copyImg.setAttribute('onclick', 'copyClipboard()');
    divSocialNetwork.appendChild(copyImg); */

    var facebookImg = document.createElement('img');
    facebookImg.setAttribute('src', 'http://mehari-consulting.com/public/img/icons/facebook.png');
    facebookImg.setAttribute('height', '20px');
    facebookImg.setAttribute('width', 'auto');
    facebookImg.setAttribute('onclick', 'window.open("https://www.facebook.com/sharer/sharer.php?u=http://mehari-consulting.com/'+elementId+'")');
    divSocialNetwork.appendChild(facebookImg);

    var twitterImg = document.createElement('img');
    twitterImg.setAttribute('src', 'http://mehari-consulting.com/public/img/icons/twitter.png');
    twitterImg.setAttribute('height', '20px');
    twitterImg.setAttribute('width', 'auto');
    twitterImg.setAttribute('onclick', 'window.open("https://twitter.com/intent/tweet?url='+
    "http://mehari-consulting.com/"+elementId+'")');
    divSocialNetwork.appendChild(twitterImg);

    document.getElementsByTagName('H1')[0].before(spacerSocialNetwork);
    document.getElementsByTagName('H1')[0].before(divSocialNetwork);
}

function copyClipboard() {
    console.log(window.isSecureContent);
    navigator.clipboard.writeText(window.location.href);
    document.execCommand("copy");
    document.getElementById("copyImg").src = "http://mehari-consulting.com/public/img/icons/paste.png";
}