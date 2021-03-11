function addImgTag(img) {
    var textArea = document.getElementById('articleAreaId');
    textArea.focus();

    var oldTextContent = textArea.value;
    var cursorPosition = textArea.selectionStart;

    var beforeCursorText = oldTextContent.substring(0, cursorPosition);
    var afterCursorText = oldTextContent.substring(cursorPosition, oldTextContent.length);

    var newTextContent = beforeCursorText + " <img src='" + img + "'> " + afterCursorText;

    textArea.value = newTextContent;
}

function logSubmit(event) {
    complicatedTitle = document.getElementById('titreAreaId').value;
    var content = document.getElementById('articleAreaId').value;

    var key = "-" + Math.random().toString(36).substring(2, 10);

    var shortTitle = complicatedTitle.toLowerCase();
    var arrayTitle = shortTitle.split(" ", 3);
    var cleanTitle = [];

    for (i = 0; i < arrayTitle.length; i++) {
        var arrayWord = arrayTitle[i].split("");
        for (j = 0; j < arrayWord.length; j++) {
            if (isAlphaNumeric(arrayWord[j]))
                cleanTitle.push(arrayWord[j]);
        }
    }

    document.getElementById('articleID').value = cleanTitle.join("") + key;
    copyFirstImgLocation();
}

function isAlphaNumeric(char) {
    var code = char.charCodeAt(0);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
        return false;
    } else {
        return true;
    }
}

function copyFirstImgLocation() {
    var content = document.getElementById("articleAreaId").value;

    var articleContent = document.createElement('div');
    articleContent.setAttribute('id', 'articlePreview');
    articleContent.setAttribute('style', "display:none");

    articleContent.innerHTML = content;
    document.body.append(articleContent);

    var firstImg = Array.from(document.getElementById('articlePreview').getElementsByTagName('img'));

    if (firstImg.length == 0) {
        document.getElementById('thumbailChooser').value = "defaultIMG.jpg";
    } else {
        var imgSource = firstImg[0].src.split('/')[(firstImg[0].src.split('/').length) - 1];
        document.getElementById('thumbailChooser').value = imgSource;
    }
    console.log("thumbail updated");
}