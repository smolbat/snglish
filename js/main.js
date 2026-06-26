var noSleep = new NoSleep(); // необходим, чтобы телефон не "засыпал"

const PHONETICS = 1;
const TRANSCRIPTION = 2;
let phoneticType = PHONETICS;
let wordsToRow = [];
let songData = [];
let timeShiftArray = [];
let selectedRow = -1;
let oldSelectedRow = -1;
let selected = {};

let audioPlayer = document.getElementById("myAudio");

(async () => { // обертка, так как внутри есть await функции
    // запрашиваем данные из внешнего файла
    let jsonResponse = await fetch("timestamps.json");
    songData = await jsonResponse.json();

    let currentWordsToRow = 0;
    Array.from($('#mySongList').children()).forEach((item, index, arr) => {
        let wordsInRow = Math.floor($(item).find('td').length / 4);
        currentWordsToRow += wordsInRow;
        wordsToRow[index] = currentWordsToRow;
     });

    timeShiftArray = songData.map( item => item.start);
    // window.scroll({top: 0, behavior: 'smooth'});
})();


//  Обработка нажатия кнопки Фонетика
$('#btnPhonetics').click(function() {
    if (phoneticType == PHONETICS) {
        phoneticType = TRANSCRIPTION;
        $('#btnPhonetics').text('Транскрипция');
        $('tr:nth-child(3)').hide()
        $('tr:nth-child(2)').show();
    } else {
        phoneticType = PHONETICS;
        $('#btnPhonetics').text('Фонетика');
        $('tr:nth-child(2)').hide();
        $('tr:nth-child(3)').show();
    }
});


// Функция навигации по песне путем выбора строки песни
$('#mySongList').click(function(event) {
    let targetElement = event.target.closest('li');
    selectedRow = $(targetElement).index();
    if (selectedRow > 0) { 
        audioPlayer.currentTime = timeShiftArray[wordsToRow[selectedRow-1]] / 1000;
    } else {
        audioPlayer.currentTime = timeShiftArray[0] / 1000; 
    }
    selectRow(selectedRow);
    console.log("When Pressed Row",selectedRow);    /// After debugging comment !!!

});

function selectRow(selectedRow) {
    $('#mySongList td').css('color', '');
    $('#mySongList li').css('background', '');
    $('#mySongList li:eq(' + selectedRow + ')').css('background', 'silver');
}

function selectWord(selected) {
    // Работаем со 2-ой и 3-ей строками в таблице (причем одна из них всегда скрыта)
    $('#mySongList tbody:eq(' + selected.currentRow + ') > tr:eq(1) > td, #mySongList tbody:eq(' + selected.currentRow + ') > tr:eq(2) > td').css('color', '');
    $('#mySongList tbody:eq(' + selected.currentRow + ') > tr:eq(1) > td:eq(' + selected.currentWord + '), #mySongList tbody:eq(' + selected.currentRow + ') > tr:eq(2) > td:eq(' + selected.currentWord + ')').css('color', 'SteelBlue');
}

function scrollToCenter(selectedRow) {
    topShift = (selectedRow+1.5)*$('#mySongList li')[0].offsetHeight+$('header')[0].offsetHeight - 0.5*window.outerHeight;
    window.scroll({top: topShift, behavior: 'smooth'});
}

function getSelectedRowAndWord(curTime) {
    let curRow;
    let curWord;
    let globalCurWord;
    globalCurWord = timeShiftArray.findLastIndex( item => item <= curTime * 1000);
    if (globalCurWord < 0) {
    } else if (globalCurWord < wordsToRow[0]) {
        curRow = 0;
        curWord = globalCurWord;
    } else {
        curRow = wordsToRow.findLastIndex( val => val <= globalCurWord)+1;
        curWord = globalCurWord - wordsToRow[curRow-1];
    }
    return { currentRow: curRow, currentWord: curWord };
}

////////////////////////////
//      Аудиомодуль
///////////////////////////
$('#btnPlay').click(function() {
    audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause();
    $('#btnPlay').text(audioPlayer.paused ? "Play" : "Pause");
});


// функция, выделяющая строки во время проигрывания песни
audioPlayer.ontimeupdate = function() {
    let curTime = audioPlayer.currentTime;
    //////// For DEBUGIN sound & titles !!!!!!!!!!!!!!!
    // $('#btnPlay').text(curTime);    /// After debugging comment !!!
    ///////////////////////////////////////
    selected = getSelectedRowAndWord(curTime);
    selectedRow = selected.currentRow;
    selectRow(selectedRow);
    selectWord(selected);
    console.log("Before renew",selectedRow);    /// After debugging comment !!!
    if (oldSelectedRow != selectedRow) {
        // console.log("Обновился выделенный ряд!!!");
        scrollToCenter(selectedRow);
    }
    oldSelectedRow = selectedRow;
    console.log("After renew",selectedRow);    /// After debugging comment !!!

}

// при выходе со страницы или перезагрузке удаляем аудио объкт
// чтобы он не кешировался в браузере
//
// возможно функцию надо переработать!!!!
window.onbeforeunload = function() {
    noSleep.disable();
    audioPlayer = null;
    delete audioPlayer;
    return
}