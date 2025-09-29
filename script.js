let currentUser = null;
let users = JSON.parse(localStorage.getItem("users")) || {};

function showRegister(){ 
  document.getElementById("loginForm").classList.add("hidden"); 
  document.getElementById("registerForm").classList.remove("hidden"); 
}

function showLogin(){ 
  document.getElementById("registerForm").classList.add("hidden"); 
  document.getElementById("loginForm").classList.remove("hidden"); 
}

function togglePassword(){ 
  const pwd=document.getElementById("loginPassword"); 
  pwd.type=pwd.type==='password'?'text':'password'; 
}

function register(){
  const fullName=document.getElementById("regFullName").value;
  const username=document.getElementById("regUsername").value;
  const password=document.getElementById("regPassword").value;
  if(users[username]){
    alert("Username exists!"); 
    return;
  }
  users[username] = {
    fullName,
    password,
    lessonsCompleted: 0,
    scores: [],
    certificates: [],
    badges: [],
    completions: {}   // tracking ng bawat lesson
  };
  localStorage.setItem("users", JSON.stringify(users));
  alert("Registration success!"); 
  showLogin();
}

function login(){
  const username=document.getElementById("loginUsername").value;
  const password=document.getElementById("loginPassword").value;
  if(users[username] && users[username].password===password){
    currentUser=username;
    if(document.getElementById("rememberMe").checked){
      localStorage.setItem("rememberedUser",username);
    } else {
      localStorage.removeItem("rememberedUser");
    }
    document.getElementById("authPage").classList.add("hidden");
    document.getElementById("homePage").classList.remove("hidden");
    document.getElementById("studentName").innerText=users[username].fullName;
  } else {
    alert("Invalid credentials");
  }
}

function logout(){
  currentUser=null;
  document.getElementById("homePage").classList.add("hidden");
  document.getElementById("authPage").classList.remove("hidden");
  document.getElementById("loginUsername").value="";
  document.getElementById("loginPassword").value="";
  document.getElementById("rememberMe").checked=false;
}

function openSubject(subject){
  document.getElementById("homePage").classList.add("hidden");
  document.getElementById("lessonPage").classList.remove("hidden");
  document.getElementById("lessonTitle").innerText=subject+" Lessons";
  showLessonContent(subject);
}

function goHome(){
  document.getElementById("lessonPage").classList.add("hidden");
  document.getElementById("profilePage").classList.add("hidden");
  document.getElementById("certificatePage").classList.add("hidden");
  document.getElementById("homePage").classList.remove("hidden");
}

// Lessons per subject
const lessonsContent = {
  Math:["Addition","Subtraction","Multiplication","Division"],
  Science:["Circulatory","Respiratory","Digestive","Nervous","Skeletal/Muscular"]
};

function showLessonContent(subject){
  const container=document.getElementById("lessonContent");
  container.innerHTML="<h3>Lessons:</h3>";
  lessonsContent[subject].forEach(lesson=>{
    const btn=document.createElement("button");
    btn.innerText=lesson;
    btn.onclick=()=>startQuiz(subject,lesson);
    container.appendChild(btn);
  });
}

// Generate question pools
function generateQuestionPool(subject,lesson){
  const questions=[];
  if(subject==="Math"){
    for(let i=0;i<200;i++){
      let a=Math.floor(Math.random()*50)+1;
      let b=Math.floor(Math.random()*50)+1;
      let q, ans;
      if(lesson==="Addition"){q=`${a} + ${b} = ?`; ans=a+b;}
      if(lesson==="Subtraction"){q=`${a+b} - ${b} = ?`; ans=a;}
      if(lesson==="Multiplication"){q=`${a} × ${b} = ?`; ans=a*b;}
      if(lesson==="Division"){q=`${a*b} ÷ ${b} = ?`; ans=a;}
      questions.push({q,a:ans,choices:shuffle([ans,ans+1,ans-1,ans+2])});
    }
  } else if(subject==="Science"){
    const scienceQuestions = generateScienceQuestions(lesson,50);
    questions.push(...scienceQuestions);
  }
  return questions;
}

function generateScienceQuestions(topic,count){
  const qs=[];
  for(let i=0;i<count;i++){
    let q,a;
    if(topic==="Circulatory"){q=`What organ pumps blood throughout the body?`; a="Heart";}
    if(topic==="Respiratory"){q=`Which organ allows us to breathe?`; a="Lungs";}
    if(topic==="Digestive"){q=`Where does food get digested first?`; a="Stomach";}
    if(topic==="Nervous"){q=`Which organ controls our body and senses?`; a="Brain";}
    if(topic==="Skeletal/Muscular"){q=`What gives our body structure and allows movement?`; a="Bones and Muscles";}
    qs.push({q,a,choices:shuffle([a,"Liver","Heart","Lungs","Stomach"])});
  }
  return qs;
}

// Start Quiz
function startQuiz(subject,lesson){
  const quizContainer=document.getElementById("quizContainer");
  quizContainer.innerHTML = "";
  const folkloreContainer=document.getElementById("folkloreContainer");
  folkloreContainer.classList.add("hidden");
  const pool=generateQuestionPool(subject,lesson);
  const quizSet=shuffle(pool).slice(0,Math.floor(Math.random()*6)+5); //5-10 questions
  let current=0, score=0;

  quizContainer.innerHTML="";
  const questionEl=document.createElement("div");
  const choicesEl=document.createElement("div");
  quizContainer.appendChild(questionEl);
  quizContainer.appendChild(choicesEl);

  function showQuestion(){
    questionEl.innerHTML=`<h4>Q${current+1}: ${quizSet[current].q}</h4>`;
    choicesEl.innerHTML="";
    quizSet[current].choices.forEach(choice=>{
      const btn=document.createElement("button");
      btn.innerText = choice;
      btn.onclick = () => {
        if(choice === quizSet[current].a){
          btn.classList.add("correct");
          score++;
        } else {
          btn.classList.add("wrong");
        }

        // disable other buttons
        Array.from(choicesEl.children).forEach(b => b.disabled = true);

        // auto-next after 0.7s
        setTimeout(() => {
          current++;
          if(current < quizSet.length){
            showQuestion();
          } else {
            finishQuiz();
          }
        }, 700);
      };
      choicesEl.appendChild(btn);
    });
  }
  showQuestion();

  function finishQuiz(){
    alert(`You scored ${score} out of ${quizSet.length}`);
    
    // Track completions
    if(!users[currentUser].completions[lesson]){
      users[currentUser].completions[lesson] = 0;
    }
    users[currentUser].completions[lesson]++;
    users[currentUser].lessonsCompleted++;
    users[currentUser].scores.push(score);

    // Award badge
    let badge = "";
    switch(users[currentUser].completions[lesson]){
      case 1: badge = "Bronze Star"; break;
      case 2: badge = "Silver Star"; break;
      case 3: badge = "Gold Star"; break;
      default: badge = "Diamond Badge";
    }
    users[currentUser].badges.push(`${lesson}: ${badge}`);

    // Save certificate record
    users[currentUser].certificates.push(`${lesson} - ${badge}`);

    // Save everything
    localStorage.setItem("users", JSON.stringify(users));

    // Show certificate immediately
    showCertificate(currentUser, lesson, badge);
  }
}

// Shuffle helper
function shuffle(array){
  for(let i=array.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [array[i],array[j]]=[array[j],array[i]];
  }
  return array;
}

// Certificate
function showCertificate(user, lesson, badge){
  document.getElementById("certificatePage").classList.remove("hidden");
  document.getElementById("certName").innerText = users[user].fullName;
  document.getElementById("certLesson").innerText = lesson;
  document.getElementById("certBadge").innerText = badge;
}

// Profile
function openProfile(){
  document.getElementById("homePage").classList.add("hidden");
  document.getElementById("profilePage").classList.remove("hidden");
  const u=users[currentUser];
  document.getElementById("profileName").innerText=u.fullName;
  document.getElementById("profileUsername").innerText=currentUser;
  document.getElementById("profileLessons").innerText=u.lessonsCompleted;
  const avg=u.scores.length?Math.round(u.scores.reduce((a,b)=>a+b)/u.scores.length):0;
  document.getElementById("profileScore").innerText=avg;

  // show certificates & badges as history
  const certList=document.getElementById("certificatesList"); 
  certList.innerHTML=""; 
  u.certificates.forEach(c=>{
    let li=document.createElement("li");
    li.innerText=c;
    certList.appendChild(li);
  });

  const badgesList=document.getElementById("badgesList"); 
  badgesList.innerHTML=""; 
  u.badges.forEach(b=>{
    let li=document.createElement("li");
    li.innerText=b;
    badgesList.appendChild(li);
  });
}
