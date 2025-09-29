let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = null;

const loginPage = document.getElementById("loginPage");
const homePage = document.getElementById("homePage");
const lessonPage = document.getElementById("lessonPage");
const quizPage = document.getElementById("quizPage");
const folklorePage = document.getElementById("folklorePage");
const certificatePage = document.getElementById("certificatePage");
const profilePage = document.getElementById("profilePage");

// Navigation
function goHome(){
  hideAll();
  homePage.classList.remove("hidden");
}
function hideAll(){[loginPage,homePage,lessonPage,quizPage,folklorePage,certificatePage,profilePage].forEach(p=>p.classList.add("hidden"));}

// Login/Register
document.getElementById("loginForm").addEventListener("submit",e=>{
  e.preventDefault();
  let u=document.getElementById("loginUser").value;
  let p=document.getElementById("loginPass").value;
  if(users[u] && users[u].pass===p){
    currentUser=u;
    if(document.getElementById("rememberMe").checked){
      localStorage.setItem("currentUser",u);
    }
    goHome();
  } else alert("Invalid login!");
});
document.getElementById("registerForm").addEventListener("submit",e=>{
  e.preventDefault();
  let full=document.getElementById("regFull").value;
  let u=document.getElementById("regUser").value;
  let p=document.getElementById("regPass").value;
  if(users[u]){alert("Username exists"); return;}
  users[u]={fullName:full,pass:p,lessonsCompleted:0,scores:[],certificates:[],badges:[]};
  localStorage.setItem("users",JSON.stringify(users));
  alert("Registered! Please login.");
  showLogin();
});
document.getElementById("toRegister").onclick=()=>{document.getElementById("loginForm").classList.add("hidden");document.getElementById("registerForm").classList.remove("hidden");};
document.getElementById("toLogin").onclick=showLogin;
function showLogin(){document.getElementById("loginForm").classList.remove("hidden");document.getElementById("registerForm").classList.add("hidden");}
function logout(){currentUser=null;localStorage.removeItem("currentUser");hideAll();loginPage.classList.remove("hidden");}

// Auto-login if remembered
if(localStorage.getItem("currentUser")){currentUser=localStorage.getItem("currentUser");goHome();}

// Subjects and Lessons
const lessons = {
  Math:["Addition","Subtraction","Multiplication","Division"],
  Science:["Circulatory System","Respiratory System","Digestive System","Nervous System","Skeletal and Muscular System"]
};
function openSubject(sub){
  hideAll();
  lessonPage.classList.remove("hidden");
  document.getElementById("lessonTitle").innerText=sub+" Lessons";
  let list=document.getElementById("lessonsList");
  list.innerHTML="";
  lessons[sub].forEach(lesson=>{
    let btn=document.createElement("button");
    btn.innerText=lesson;
    btn.onclick=()=>startQuiz(sub,lesson);
    list.appendChild(btn);
  });
}

// Quiz
function startQuiz(subject,lesson){
  hideAll();
  quizPage.classList.remove("hidden");
  document.getElementById("quizTitle").innerText=`${lesson} Quiz`;
  const pool=generateQuestionPool(subject,lesson);
  const quizSet=shuffle(pool).slice(0,Math.floor(Math.random()*6)+5);
  let current=0,score=0;

  const quizContainer=document.getElementById("quizContainer");
  function showQuestion(){
    quizContainer.innerHTML="";
    let q=quizSet[current];
    let h=document.createElement("h3");
    h.innerText=`Q${current+1}: ${q.q}`;
    quizContainer.appendChild(h);
    q.choices.forEach(choice=>{
      let btn=document.createElement("button");
      btn.innerText=choice;
      btn.onclick=()=>{
        if(choice===q.a){btn.classList.add("correct");score++;}
        else btn.classList.add("wrong");
        Array.from(quizContainer.querySelectorAll("button")).forEach(b=>b.disabled=true);
        setTimeout(()=>{
          current++;
          if(current<quizSet.length) showQuestion();
          else finishQuiz();
        },1500);
      };
      quizContainer.appendChild(btn);
    });
  }
  showQuestion();

  function finishQuiz(){
    alert(`You scored ${score} out of ${quizSet.length}`);
    hideAll();
    folklorePage.classList.remove("hidden");
    document.getElementById("folkloreText").innerText=`Congrats! Here's a folklore about ${lesson}.`;
    users[currentUser].lessonsCompleted++;
    users[currentUser].scores.push(score);
    users[currentUser].certificates.push(lesson);
    localStorage.setItem("users",JSON.stringify(users));
    showCertificate(currentUser,lesson);
  }
}

// Question Pools
function generateQuestionPool(subject,lesson){
  let qs=[];
  if(subject==="Math"){
    for(let i=0;i<100;i++){
      let a=Math.floor(Math.random()*10+1),b=Math.floor(Math.random()*10+1),q,ans;
      if(lesson==="Addition"){q=`${a}+${b}=?`;ans=(a+b).toString();}
      if(lesson==="Subtraction"){q=`${a+b}-${a}=?`;ans=b.toString();}
      if(lesson==="Multiplication"){q=`${a}x${b}=?`;ans=(a*b).toString();}
      if(lesson==="Division"){q=`${a*b}/${a}=?`;ans=b.toString();}
      qs.push({q:q,a:ans,choices:shuffle([ans,(ans+1).toString(),(ans+2).toString(),(ans-1).toString()])});
    }
  }
  if(subject==="Science"){
    for(let i=0;i<50;i++){
      let q=`Sample ${lesson} Question ${i+1}?`;
      let ans="Correct Answer";
      qs.push({q:q,a:ans,choices:shuffle([ans,"Option1","Option2","Option3"])});
    }
  }
  return qs;
}

// Shuffle
function shuffle(arr){for(let i=arr.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}

// Certificate
function showCertificate(user,lesson){
  certificatePage.classList.remove("hidden");
  document.getElementById("certName").innerText=users[user].fullName;
  document.getElementById("certLesson").innerText=lesson;
}

// Profile
function openProfile(){
  hideAll();
  profilePage.classList.remove("hidden");
  let u=users[currentUser];
  document.getElementById("profileName").innerText=u.fullName;
  document.getElementById("profileUsername").innerText=currentUser;
  document.getElementById("profileLessons").innerText=u.lessonsCompleted;
  let avg=u.scores.length?Math.round(u.scores.reduce((a,b)=>a+b)/u.scores.length):0;
  document.getElementById("profileScore").innerText=avg;
  let cl=document.getElementById("certificatesList");cl.innerHTML="";u.certificates.forEach(c=>{let li=document.createElement("li");li.innerText=c;cl.appendChild(li);});
  let bl=document.getElementById("badgesList");bl.innerHTML="";u.badges.forEach(b=>{let li=document.createElement("li");li.innerText=b;bl.appendChild(li);});
}
