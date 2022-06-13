# Library Management System
# ROUTES 

## Student and Teachers Register
URL--https://librarymanagement4.herokuapp.com/auth/signup POST<br/>
<pre>
Req params-  { <br/>
    "name": "name of user--string",
    "email": "email of user -- string",
    "phone_no": "mob no -- string",
    "password": "password -- string",
    "reg_no": "reg no -- string",
    "gender": "gender -- string",
    "type": "student or teacher --string"
}

res--> JWT token with user deatils
</pre>

## Student and Teacher Login
URL- https://librarymanagement4.herokuapp.com/auth/signin POST <br/>

<pre>
Req params - {
      "email" - "Email of the user",
      "password" - "password provided at the time of registration
}
Res- JWT token with user deatils
</pre>

## Find Student by name
URL- https://librarymanagement4.herokuapp.com/findstudent GET <br/>
<pre>
Req params - {
       "search" -- "Search Key name of student"
}
with JWT token for authentication
Res- Deatils of student or None received
</pre>

## List all Students
URL- https://librarymanagement4.herokuapp.com/AllStudents GET <br/>
<pre>
Req params -- none with JWT token passed
Res -- We will get all students present in the database
</pre>

## CRUD operations on books
### Add book by teacher only
URL- https://librarymanagement4.herokuapp.com/addBook GET 
<pre>
Req params -{
   "title" : "Tite of the book --string",
   "ISBN" : "unique ISBN number --string",
   "stock" : no of books in stock --number,
   "author" : "Author of the book -- string",
   "description" : "Description of the book -- string",
   "category" : "Category book belongs to -- string" 
}
Res - Book is Added Successfully
</pre>

### Update book Details by teacher only
URL -https://librarymanagement4.herokuapp.com/updateBook POST
<pre>
Req params -{
   "title" : "Tite of the book --string",
   "ISBN" : "unique ISBN number --string",
   "stock" : no of books in stock --number,
   "author" : "Author of the book -- string",
   "description" : "Description of the book -- string",
   "category" : "Category book belongs to -- string" 
}
Res - Book is Updated Successfully
</pre>

### Delete Book by teacher Only
URL- https://librarymanagement4.herokuapp.com/deleteBook GET
<pre>
Req params -{
   "title" : "Tite of the book --string",
   "ISBN" : "unique ISBN number --string",
   "stock" : no of books in stock --number,
   "author" : "Author of the book -- string",
   "description" : "Description of the book -- string",
   "category" : "Category book belongs to -- string" 
}
Res- Book deleted Successfully
</pre>

### Get All Books 
URL - https://librarymanagement4.herokuapp.com/getAllbooks GET
<pre>
Req params- Null
Res- Returns All Books present in the database
</pre>


## ISSUE A BOOK BY STUDENT
URL - https://librarymanagement4.herokuapp.com/issueBook POST
<pre>
Req params - {
    "ISBN" : "ISBN no of the book to be issued"
}
Res- Book is being successfuly Issued
</pre>

## RENEW A BOOK
URL - https://librarymanagement4.herokuapp.com/renewBook POST
<pre>
Req params - {
    "ISBN" : "ISBN no of the book to be issued"
}
Res- Book is renewed for 7 days Successfully
</pre>

## Fine calculated after 7 days
URL - https://librarymanagement4.herokuapp.com/fine POST
<pre>
Req params-- Null with Jwt token for user
Res - fine has being successfully calculated and updated
</pre>

