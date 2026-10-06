"use strict";

// Datos iniciales (semilla) de la "base de datos".
// En produccion (Netlify) se copian a Netlify Blobs en la primera
// lectura, de modo que las funciones batch puedan modificarlos de
// forma durable. En local se usan los archivos de backend/data/.

module.exports = {
  books: [
    {
      id: 1,
      title: 'Operating System Concepts',
      edition: '9th',
      copyright: 2012,
      language: 'English',
      pages: 976,
      author: 'Abraham Silberschatz',
      author_id: 1,
      publisher: 'John Wiley & Sons',
      publisher_id: 1,
    },
    {
      id: 2,
      title: 'Database System Concepts',
      edition: '6th',
      copyright: 2010,
      language: 'English',
      pages: 1376,
      author: 'Abraham Silberschatz',
      author_id: 1,
      publisher: 'McGraw-Hill',
      publisher_id: 2,
    },
    {
      id: 3,
      title: 'Computer Networks',
      edition: '5th',
      copyright: 2010,
      language: 'English',
      pages: 960,
      author: 'Andrew S. Tanenbaum',
      author_id: 2,
      publisher: 'Pearson Education',
      publisher_id: 3,
    },
    {
      id: 4,
      title: 'Modern Operating Systems',
      edition: '4th',
      copyright: 2014,
      language: 'English',
      pages: 1136,
      author: 'Andrew S. Tanenbaum',
      author_id: 2,
      publisher: 'Pearson Education',
      publisher_id: 3,
    },
  ],
  authors: [
    {
      id: 1,
      author: 'Abraham Silberschatz',
      nationality: 'Israeli / American',
      birth_year: 1952,
      fields: 'Databases, Operating Systems',
      books: [
        { book_id: 1, title: 'Operating System Concepts' },
        { book_id: 2, title: 'Database System Concepts' },
      ],
    },
    {
      id: 2,
      author: 'Andrew S. Tanenbaum',
      nationality: 'Dutch / American',
      birth_year: 1944,
      fields: 'Operating Systems, Networks',
      books: [
        { book_id: 3, title: 'Computer Networks' },
        { book_id: 4, title: 'Modern Operating Systems' },
      ],
    },
  ],
  publishers: [
    {
      id: 1,
      publisher: 'John Wiley & Sons',
      country: 'United States',
      founded: 1807,
      genere: 'Technical books',
      books: [{ book_id: 1, title: 'Operating System Concepts' }],
    },
    {
      id: 2,
      publisher: 'McGraw-Hill',
      country: 'United States',
      founded: 1888,
      genere: 'Textbooks',
      books: [{ book_id: 2, title: 'Database System Concepts' }],
    },
    {
      id: 3,
      publisher: 'Pearson Education',
      country: 'United Kingdom',
      founded: 1844,
      genere: 'Education',
      books: [
        { book_id: 3, title: 'Computer Networks' },
        { book_id: 4, title: 'Modern Operating Systems' },
      ],
    },
  ],
};
