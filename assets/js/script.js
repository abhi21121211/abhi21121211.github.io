$(document).ready(function () {
  $("#menu").click(function () {
    $(this).toggleClass("fa-times");
    $(".navbar").toggleClass("nav-toggle");
  });

  $(window).on("scroll load", function () {
    $("#menu").removeClass("fa-times");
    $(".navbar").removeClass("nav-toggle");

    if (window.scrollY > 60) {
      document.querySelector("#scroll-top").classList.add("active");
    } else {
      document.querySelector("#scroll-top").classList.remove("active");
    }

    // scroll spy
    $("section").each(function () {
      let height = $(this).height();
      let offset = $(this).offset().top - 200;
      let top = $(window).scrollTop();
      let id = $(this).attr("id");

      if (top > offset && top < offset + height) {
        $(".navbar ul li a").removeClass("active");
        $(".navbar").find(`[href="#${id}"]`).addClass("active");
      }
    });
  });

  // smooth scrolling
  $('a[href*="#"]').on("click", function (e) {
    e.preventDefault();
    $("html, body").animate(
      {
        scrollTop: $($(this).attr("href")).offset().top,
      },
      500,
      "linear"
    );
  });

  // <!-- emailjs to mail contact form data -->
  document.addEventListener("DOMContentLoaded", function () {
    emailjs.init("c4b-Ixf2WGkDkMfje"); // Initialize Email.js with your API key

    // Add an event listener to the form submit button
    document
      .getElementById("submit-button")
      .addEventListener("click", function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Get form data
        var name = document.getElementById("name");
        var email = document.getElementById("email");
        var phone = document.getElementById("phone");
        var message = document.getElementById("message");

        // Check if the elements exist before accessing their values
        if (name && email && phone && message) {
          var sendername = name.value;
          var senderemail = email.value;
          var subject = phone.value;
          var messageText = message.value;

          // Prepare parameters for sending
          var params = {
            sendername: sendername,
            senderemail: senderemail,
            subject: subject,
            message: messageText,
          };

          var serviceID = "service_m7fmold"; // Your Email Service ID
          var templateID = "template_ta4qdi2"; // Your Email Template ID

          // Send the email using Email.js
          emailjs
            .send(serviceID, templateID, params)
            .then(function (response) {
              console.log("Email sent successfully:", response);
              alert("Email sent successfully");
              document.getElementById("contact-form").reset();
            })
            .catch(function (error) {
              console.error("Email sending failed:", error);
              alert("Email sending failed. Please try again later.");
            });
        } else {
          console.error("One or more form elements not found.");
          alert("An error occurred. Please try again.");
        }
      });
  });
});

document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    document.title = "Portfolio | Abhishek Dukare";
    $("#favicon").attr("href", "assets/images/favicon.png");
  } else {
    document.title = "Come Back To Portfolio";
    $("#favicon").attr("href", "assets/images/favhand.png");
  }
});

// <!-- typed js effect starts -->
var typed = new Typed(".typing-text", {
  strings: [
    "frontend development",
    "backend development",
    "full stack development",
    "web development",
  ],
  loop: true,
  typeSpeed: 50,
  backSpeed: 25,
  backDelay: 500,
});
// <!-- typed js effect ends -->

async function fetchData(type = "skills") {
  let response;
  type === "skills"
    ? (response = await fetch("skills.json"))
    : (response = await fetch("./projects/projects.json"));
  const data = await response.json();
  return data;
}

function showSkills(skills) {
  let skillsContainer = document.getElementById("skillsContainer");
  let skillHTML = "";
  skills.forEach((skill) => {
    skillHTML += `
        <div class="bar">
        <div class="info skills-card">
        <img class="skills-card-img" src=${skill.icon} alt="skill" />
        <span class="skills-card-name">${skill.name}</span>
      </div>
             
            </div>`;
  });
  skillsContainer.innerHTML = skillHTML;
}

function showProjects(projects) {
  let projectsContainer = document.querySelector("#projects .box-container");
  let projectHTML = "";
  projects
    .slice(0, 10)
    .filter((project) => project.category != "android")
    .forEach((project) => {
      projectHTML += `
      
        <div class="box tilt project-card">
      <img draggable="false" src="assets/images/projects/${project.image}.png" alt="project" />
     
      <div class="content">
        <div class="tag">
        <h3 class="project-title">${project.name}</h3>
        </div>
        <div class="desc">
          <p class="project-description">${project.desc}</p>
          <div class="project-tech-stack">
          <div class="btns">
<a href="${project.links.view}" class="btn project-deployed-link" target="_blank"><i class="fas fa-eye"></i> View</a>
  <a  href="${project.links.code}" class="btn project-github-link" target="_blank">Code <i class="fas fa-code"></i></a>
          

         

          </div>
          </div>
        
      </div>
    </div>
    </div>`;
    });
  projectsContainer.innerHTML = projectHTML;

  // <!-- tilt js effect starts -->
  VanillaTilt.init(document.querySelectorAll(".tilt"), {
    max: 15,
  });
  // <!-- tilt js effect ends -->

  /* ===== SCROLL REVEAL ANIMATION ===== */
  const srtop = ScrollReveal({
    origin: "top",
    distance: "80px",
    duration: 1000,
    reset: true,
  });

  /* SCROLL PROJECTS */
  srtop.reveal(".work .box", { interval: 200 });
}

fetchData().then((data) => {
  showSkills(data);
});

fetchData("projects").then((data) => {
  showProjects(data);
});

// <!-- tilt js effect starts -->
VanillaTilt.init(document.querySelectorAll(".tilt"), {
  max: 15,
});
// <!-- tilt js effect ends -->

// disable developer mode
document.onkeydown = function (e) {
  if (e.keyCode == 123) {
    return false;
  }
  if (e.ctrlKey && e.shiftKey && e.keyCode == "I".charCodeAt(0)) {
    return false;
  }
  if (e.ctrlKey && e.shiftKey && e.keyCode == "C".charCodeAt(0)) {
    return false;
  }
  if (e.ctrlKey && e.shiftKey && e.keyCode == "J".charCodeAt(0)) {
    return false;
  }
  if (e.ctrlKey && e.keyCode == "U".charCodeAt(0)) {
    return false;
  }
};

/* ===== SCROLL REVEAL ANIMATION ===== */
const srtop = ScrollReveal({
  origin: "top",
  distance: "80px",
  duration: 1000,
  reset: true,
});

/* SCROLL HOME */
srtop.reveal(".home .content h3", { delay: 200 });
srtop.reveal(".home .content p", { delay: 200 });
srtop.reveal(".home .content .btn", { delay: 200 });

srtop.reveal(".home .image", { delay: 400 });
srtop.reveal(".home .linkedin", { interval: 600 });
srtop.reveal(".home .github", { interval: 800 });
srtop.reveal(".home .twitter", { interval: 1000 });
srtop.reveal(".home .telegram", { interval: 600 });
srtop.reveal(".home .instagram", { interval: 600 });
srtop.reveal(".home .dev", { interval: 600 });

/* SCROLL ABOUT */
srtop.reveal(".about .content h3", { delay: 200 });
srtop.reveal(".about .content .tag", { delay: 200 });
srtop.reveal(".about .content p", { delay: 200 });
srtop.reveal(".about .content .box-container", { delay: 200 });
srtop.reveal(".about .content .resumebtn", { delay: 200 });

/* SCROLL SKILLS */
srtop.reveal(".skills .container", { interval: 200 });
srtop.reveal(".skills .container .bar", { delay: 400 });

/* SCROLL EDUCATION */
srtop.reveal(".education .box", { interval: 200 });

/* SCROLL PROJECTS */
srtop.reveal(".work .box", { interval: 200 });

/* SCROLL EXPERIENCE */
srtop.reveal(".experience .timeline", { delay: 400 });
srtop.reveal(".experience .timeline .container", { interval: 400 });

/* SCROLL CONTACT */
srtop.reveal(".contact .container", { delay: 400 });
srtop.reveal(".contact .container .form-group", { delay: 400 });

//navbar resume btn

var resume1 = document.getElementById("resume-link-1");
resume1.addEventListener("click", function () {
  const previewUrl =
    "https://drive.google.com/file/d/1L2iLQc9jbfP9uGNFg96UOzsNN3NsRu2e/view?usp=sharing";
    
  const downloadUrl =
    "https://www.dropbox.com/s/vryemzdjb9vrc81/Abhishek%20Dukare.pdf?dl=1";

  window.open(previewUrl, "_blank");
  window.location.href = downloadUrl;
});


// PHone contact
var contactPhoneIcon = document.getElementById("contact-phone");
contactPhoneIcon.addEventListener("click", function () {
    // Replace "1234567890" with the desired phone number
    window.location.href = "tel:7020162627";
})