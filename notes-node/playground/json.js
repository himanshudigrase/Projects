// var obj ={
//     name : 'Hims'
// };
// var stringObj = JSON.stringify(obj);
// console.log(typeof stringObj);
// console.log(stringObj);

// var string = '{"name":"Hims","age":"25"}';
// var Obj = JSON.parse(string);
// console.log(typeof Obj);
// console.log(Obj);

const fs = require('fs');

var originalNote = {
    title: 'Some title',
    body : 'Some Body'
};
 var originalNoteString  = JSON.stringify(originalNote);
 fs.writeFileSync('notes.json',originalNoteString);

 var noteString = fs.readFileSync('notes.json');
 var note = JSON.parse(noteString);
 console.log(typeof note);
 console.log(note.title);