//STATE

let reviewList = []
let reviewToEditId = null
let user = ""
let movieId = 3

//rendering and listening

const reviewsContainer = document.getElementById("reviews-container")
const reviewStarsSelect = document.getElementById("review-stars-select")
const reviewTextarea = document.getElementById("review-textarea")
const saveReviewButton = document.getElementById("save-review-button")

//render a list of reviews
//rendering means creating html elements and attaching them to the DOM
//listening means attaching event listeners to elements
function renderReviewList() {
    reviewsContainer.innerHTML = ""
    if(reviewList.length ===0) {
        reviewsContainer.innerHTML = "No reviews yet"
    }

    //each review mapped to a div and appended to the container
    reviewList.map(renderReview).forEach(div=> reviewsContainer.appendChild(div))
}

//render one review
//render a single review by creating a div and appending it to the container
//appening means to add to the end of the container
//container means the element that holds the reviews
function renderReview(review) {
    const reviewDiv = document.createElement("div")
    reviewDiv.className = "bg-light mb-3 pt-4"
    reviewDiv.innerHTML = `
    <h5>${review.author}</h5>
    <p>${Array(review.stars).fill(null).map(_ => "star").join("")}</p>
    <p>${review.text}</p>
    <button class="edit-button btn btn-sm btn-outline-primary">Edit</button>
    <button class="delete-button btn btn-sm btn-outline-danger">Delete</button>
`;


    //attach event listeners
    reviewDiv.querySelector(".edit-button").addEventListener("click", () => {
        reviewToEditId = review.movieId;
        renderReviewForm(review);
    })

    reviewDiv.querySelector(".delete-button").addEventListener("click", async () => {
       //delete on backend
       await deleteReview(review.id)

       //delete on frontend
        const indexToDelete = reviewList.indexOf(review)
        reviewList.splice(indexToDelete, 1)

        renderReviewList()
    })
    return reviewDiv
}

//UPDATING
//updating means changing the data in the form
//updating means changing the data in the backend and frontend
function renderReviewForm(reviewData) {
    reviewStarsSelect.value = reviewData.stars
    reviewTextarea.value= reviewData.text
}


//after save button is clicked, either save an edit or create
//await means wait for the function to finish before moving on
//async means the function is asynchronous and will return a promise
//a promise is a value that will be available in the future
async function onSaveReviewClick(event) {
   event.preventDefault()
   const reviewData = {
    author: user,
    movieId: movieId,
    text: reviewTextarea.value,
    stars: parseInt(reviewStarsSelect.value)
   } 
   console.log(reviewData)

   if(reviewToEditId !== null) {
    //update backend
    reviewData.id = reviewToEditId
   await putReview(reviewData)

    //update frontend
    const indexToReplace = reviewList.findIndex(r => r.id === reviewToEditId)
    reviewList[indexToReplace] = reviewData
   } else {
    //update on backend
    const createdReview = await postReview(reviewData)
   
   //update on frontend
   reviewList.push(createdReview)
   }

renderReviewList()
reviewToEditId = null
//clear form
renderReviewForm({stars: 1, text: ""})
   }

   //FETCHING
//fetching means getting data from the backend/database/server
   async function fetchAllReviews() {
    const response = await fetch("http://localhost:3000/reviews")
    return response.json()
   }

   async function postReview(newReviewData) {
       const response = await fetch("http://localhost:3000/reviews/", {
           method: "POST",
           headers: {
               "Content-Type": "application/json"},
           body: JSON.stringify(newReviewData)
       })
       return response.json()
   }

   async function putReview(updatedReview) {
    await fetch("http://localhost:3000/reviews/" + updatedReview.id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedReview)
    });
}

   
   async function deleteReview(idToDelete) {
    await fetch("http://localhost:3000/reviews/" + idToDelete, {
        method: "DELETE"
    })
   }


   //START UP
   //this code runs when the page loads
    //this code fetches the reviews and renders them
   async function startUp() {
    reviewList = await fetchAllReviews();
    console.log("Reviews fetched:", reviewList); // Check the data
    renderReviewList(); // Only render once reviews are fetched
}
startUp();
