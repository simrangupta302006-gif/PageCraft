
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Templates.css";

const templates = [
  {
    id: "teacher",
    name: "Teacher & Educator",
    category: "Education",
    theme: "professional",
    icon: "🎓",
    description: "Showcase teaching experience, qualifications, subjects and educational achievements.",
    role: "Teacher & Educator",
    intro: "Making learning meaningful, engaging and accessible for every student.",
    about: "I am a dedicated educator passionate about student development, innovative teaching methods and lifelong learning.",
    skills: "Lesson Planning, Classroom Management, Curriculum Development, Communication",
    projectTitle: "Teaching Resources & Achievements",
    projectDescription: "Showcase lesson plans, educational resources, workshops, classroom initiatives and student projects.",
    experience: "Add your teaching experience, institution, responsibilities and achievements here.",
    footer: "Inspiring learners, shaping futures."
  },
  {
    id: "student",
    name: "Student Portfolio",
    category: "Education",
    theme: "student",
    icon: "📚",
    description: "A polished portfolio for academic work, internships, achievements and extracurricular activities.",
    role: "Student",
    intro: "Curious learner building skills through projects, collaboration and practical experience.",
    about: "I am a motivated student eager to apply classroom knowledge to real-world challenges and continue developing professionally.",
    skills: "Research, Teamwork, Problem Solving, Communication, Project Management",
    projectTitle: "Academic Projects & Achievements",
    projectDescription: "Feature college projects, certifications, competitions, volunteering and extracurricular accomplishments.",
    experience: "",
    footer: "Learning today. Creating tomorrow."
  },
  {
    id: "fresher",
    name: "Fresher & Graduate",
    category: "Career",
    theme: "minimal",
    icon: "🚀",
    description: "A recruiter-friendly portfolio focused on skills, projects, education and career potential.",
    role: "Aspiring Professional",
    intro: "An enthusiastic graduate ready to learn, contribute and solve meaningful problems.",
    about: "I am an entry-level candidate building practical skills through academic projects, independent learning and hands-on practice.",
    skills: "Problem Solving, Communication, Teamwork, Adaptability, Technical Skills",
    projectTitle: "Projects & Certifications",
    projectDescription: "Highlight your strongest projects, internships, certifications, GitHub repositories and measurable achievements.",
    experience: "",
    footer: "Open to opportunities and continuous learning."
  },
  {
    id: "working-professional",
    name: "Working Professional",
    category: "Career",
    theme: "professional",
    icon: "💼",
    description: "Present career progression, expertise, measurable impact and professional achievements.",
    role: "Working Professional",
    intro: "Delivering thoughtful solutions and measurable results through experience and collaboration.",
    about: "I am a results-oriented professional who values continuous improvement, strategic thinking and effective teamwork.",
    skills: "Leadership, Strategy, Communication, Project Delivery, Problem Solving",
    projectTitle: "Selected Work & Achievements",
    projectDescription: "Describe significant projects, your responsibilities, business impact and measurable outcomes.",
    experience: "Add your current and previous roles, organizations, dates, responsibilities and accomplishments.",
    footer: "Building value through meaningful work."
  },
  {
    id: "entrepreneur",
    name: "Entrepreneur & Founder",
    category: "Business",
    theme: "startup",
    icon: "💡",
    description: "Present your venture, services, mission, milestones and business collaborations.",
    role: "Entrepreneur & Founder",
    intro: "Turning ideas into useful products, services and sustainable business opportunities.",
    about: "I enjoy identifying problems, developing practical solutions and building products that create value for customers.",
    skills: "Business Strategy, Product Development, Leadership, Innovation, Networking",
    projectTitle: "Ventures & Business Initiatives",
    projectDescription: "Showcase your startup, products, services, milestones, case studies and collaborations.",
    experience: "Add your founder experience, ventures, business responsibilities and milestones.",
    footer: "Ideas become impact through action."
  },
  {
    id: "content-creator",
    name: "Content Creator",
    category: "Creative",
    theme: "creative",
    icon: "🎬",
    description: "Show your content, audience platforms, collaborations and creative achievements.",
    role: "Content Creator",
    intro: "Creating engaging content that informs, inspires and connects with audiences.",
    about: "I create content around my areas of interest, combining storytelling, research and creative experimentation.",
    skills: "Storytelling, Video Editing, Content Strategy, Social Media, Copywriting",
    projectTitle: "Featured Content & Collaborations",
    projectDescription: "Add links to your best videos, posts, campaigns, channels, brand collaborations and published content.",
    experience: "Add creator roles, collaborations, campaign results and relevant experience.",
    footer: "Let's create something worth sharing."
  },
  {
    id: "developer",
    name: "Software Developer",
    category: "Technology",
    theme: "developer",
    icon: "💻",
    description: "A technical portfolio for applications, repositories, technology stacks and development experience.",
    role: "Software Developer",
    intro: "Building reliable, user-focused software through clean code and continuous learning.",
    about: "I enjoy developing practical applications, learning new technologies and solving problems through software engineering.",
    skills: "Java, JavaScript, React, Node.js, MongoDB, SQL, Git",
    projectTitle: "Featured Software Projects",
    projectDescription: "Include project objectives, your technical contribution, technologies used, GitHub repositories and live demos.",
    experience: "Add internships, developer roles, open-source contributions and relevant technical experience.",
    footer: "Design. Develop. Improve."
  },
  {
    id: "uiux",
    name: "UI/UX Designer",
    category: "Design",
    theme: "creative",
    icon: "✏️",
    description: "Highlight user research, design thinking, wireframes, prototypes and case studies.",
    role: "UI/UX Designer",
    intro: "Designing intuitive digital experiences grounded in user needs and thoughtful interaction.",
    about: "I combine research, visual design and usability principles to create accessible and meaningful digital experiences.",
    skills: "Figma, Wireframing, Prototyping, User Research, Design Systems, Usability Testing",
    projectTitle: "UX Case Studies",
    projectDescription: "Present the problem, research, user flows, wireframes, prototypes, design decisions and outcomes.",
    experience: "Add design internships, freelance projects, agency work and product design experience.",
    footer: "Good design makes complexity feel simple."
  },
  {
    id: "graphic-designer",
    name: "Graphic Designer",
    category: "Design",
    theme: "creative",
    icon: "🎨",
    description: "A visual-first portfolio for branding, identity, illustration and campaign design.",
    role: "Graphic Designer",
    intro: "Creating memorable visual identities and clear, compelling communication.",
    about: "I use typography, color, composition and visual storytelling to communicate ideas with purpose.",
    skills: "Adobe Photoshop, Illustrator, Typography, Branding, Layout, Visual Storytelling",
    projectTitle: "Selected Design Work",
    projectDescription: "Showcase brand identities, posters, illustrations, campaign designs and client projects with images and links.",
    experience: "Add design roles, freelance clients, internships and creative collaborations.",
    footer: "Ideas expressed through visual design."
  },
  {
    id: "photographer",
    name: "Photographer",
    category: "Creative",
    theme: "minimal",
    icon: "📷",
    description: "An elegant photography portfolio for galleries, assignments, packages and bookings.",
    role: "Photographer",
    intro: "Capturing people, places and stories through a distinctive visual perspective.",
    about: "I approach photography through observation, composition, light and storytelling to create images with character.",
    skills: "Portrait Photography, Photo Editing, Lighting, Composition, Lightroom, Visual Storytelling",
    projectTitle: "Photography Gallery",
    projectDescription: "Feature your best photographs, galleries, photography categories, exhibitions and client assignments.",
    experience: "Add photography assignments, client work, exhibitions and relevant experience.",
    footer: "Every photograph tells a story."
  },
  {
    id: "marketing",
    name: "Marketing Professional",
    category: "Business",
    theme: "startup",
    icon: "📈",
    description: "Demonstrate campaign strategy, marketing skills, case studies and business results.",
    role: "Marketing Professional",
    intro: "Connecting brands with audiences through insight-driven campaigns and clear messaging.",
    about: "I enjoy understanding customer needs, developing marketing strategies and improving campaign performance through data.",
    skills: "SEO, Content Marketing, Analytics, Social Media, Campaign Strategy, Copywriting",
    projectTitle: "Campaigns & Case Studies",
    projectDescription: "Showcase campaign objectives, your contribution, target audiences, strategy and verified performance metrics.",
    experience: "Add marketing roles, campaign responsibilities, clients and measurable outcomes.",
    footer: "Strategy backed by creativity and insight."
  },
  {
    id: "architect",
    name: "Architect",
    category: "Design",
    theme: "minimal",
    icon: "🏛️",
    description: "Showcase architectural concepts, plans, renderings, built work and design philosophy.",
    role: "Architectural Designer",
    intro: "Exploring thoughtful spaces through function, material, context and form.",
    about: "I am interested in creating spaces that respond to human needs, environmental context and design principles.",
    skills: "AutoCAD, Revit, SketchUp, 3D Visualization, Technical Drawings, Spatial Planning",
    projectTitle: "Selected Architecture Projects",
    projectDescription: "Include project briefs, site context, plans, sections, renderings, materials and your specific contribution.",
    experience: "Add studio experience, internships, site work and architectural projects.",
    footer: "Thoughtful spaces for better living."
  },
  {
    id: "writer",
    name: "Writer & Author",
    category: "Creative",
    theme: "minimal",
    icon: "✍️",
    description: "An editorial-style portfolio for articles, essays, books, copywriting and published work.",
    role: "Writer & Author",
    intro: "Using words to explain ideas, tell stories and make complex subjects accessible.",
    about: "I write with an emphasis on clarity, voice, research and an understanding of the intended audience.",
    skills: "Writing, Editing, Research, Copywriting, Storytelling, Content Strategy",
    projectTitle: "Selected Writing & Publications",
    projectDescription: "Feature articles, essays, published work, newsletters, books and external publication links.",
    experience: "Add editorial roles, freelance assignments, publications and writing collaborations.",
    footer: "Words create connections."
  }
];

const categories = [
  "All",
  "Education",
  "Career",
  "Technology",
  "Design",
  "Creative",
  "Business"
];

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function createTemplateBlocks(template) {
  return [
    {
      id: createId(),
      type: "hero",
      data: {
        name: "Your Name",
        role: template.role,
        description: template.intro,
        buttonText: "Contact Me",
        profileImage: "",
        introduction: template.intro,
        links: {
          website: "",
          linkedin: "",
          github: "",
          instagram: "",
          behance: "",
          dribbble: "",
          youtube: "",
          medium: "",
          portfolio: ""
        }
      }
    },
    {
      id: createId(),
      type: "about",
      data: {
        title: "About Me",
        description: template.about,
        introduction: template.intro
      }
    },
    {
      id: createId(),
      type: "skills",
      data: {
        title: "Skills & Expertise",
        skills: template.skills
      }
    },
    {
      id: createId(),
      type: "projects",
      data: {
        title: template.projectTitle,
        projectTitle: "Featured Work",
        description: template.projectDescription,
        projects: [],
        links: []
      }
    },
    {
      id: createId(),
      type: "experience",
      data: {
        title: "Experience",
        role: "",
        company: "",
        description: template.experience,
        hidden: !template.experience
      }
    },
    {
      id: createId(),
      type: "contact",
      data: {
        title: "Let's Connect",
        email: "",
        phone: "",
        location: "",
        website: "",
        linkedin: "",
        github: "",
        instagram: "",
        behance: "",
        dribbble: "",
        youtube: "",
        medium: "",
        otherLinks: [],
        footerText: template.footer
      }
    }
  ];
}

export default function Templates() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [creatingId, setCreatingId] = useState("");
  const [error, setError] = useState("");

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesCategory =
        category === "All" || template.category === category;

      const matchesSearch =
        !query ||
        `${template.name} ${template.description} ${template.role} ${template.category}`
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const handleUseTemplate = async (template) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setCreatingId(template.id);
    setError("");

    try {
      const createResponse = await fetch(
        "http://localhost:5000/api/portfolios",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: `${template.name} Portfolio`,
            theme: template.theme
          })
        }
      );

      const createdData = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(
          createdData.message || "Could not create your portfolio."
        );
      }

      const portfolio = createdData.portfolio || createdData;

      if (!portfolio._id) {
        throw new Error("The server did not return a portfolio ID.");
      }

      const blocks = createTemplateBlocks(template);

      const updateResponse = await fetch(
        `http://localhost:5000/api/portfolios/${portfolio._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            content: {
              blocks,
              profile: {
                profession: template.id,
                displayName: "Your Name",
                profileImage: "",
                links: {},
                footer: template.footer
              }
            }
          })
        }
      );

      const updatedData = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(
          updatedData.message ||
            "Portfolio created, but the template content could not be saved."
        );
      }

      navigate(`/editor/${portfolio._id}`);
    } catch (err) {
      setError(err.message || "Unable to create the portfolio.");
      setCreatingId("");
    }
  };

  return (
    <main className="templates-page">
      <header className="templates-header">
        <button
          type="button"
          className="templates-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <div className="templates-heading">
          <span className="templates-eyebrow">PAGECRAFT STUDIO</span>
          <h1>Find your perfect portfolio template</h1>
          <p>
            Choose a design tailored to your profession. Personalize your
            content, showcase your work and build your professional presence.
          </p>
        </div>

        <div className="templates-search-wrap">
          <input
            type="search"
            className="templates-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search developer, teacher, photographer..."
            aria-label="Search portfolio templates"
          />
        </div>
      </header>

      <nav className="templates-categories" aria-label="Template categories">
        {categories.map((item) => (
          <button
            type="button"
            key={item}
            className={
              category === item
                ? "templates-category active"
                : "templates-category"
            }
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      {error && (
        <div className="templates-error" role="alert">
          {error}
        </div>
      )}

      <section className="templates-results">
        <div className="templates-results-heading">
          <div>
            <h2>Explore templates</h2>
            <p>
              {filteredTemplates.length} template
              {filteredTemplates.length === 1 ? "" : "s"} available
            </p>
          </div>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="templates-empty">
            <h3>No matching templates</h3>
            <p>Try a different search or select another category.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="templates-grid">
            {filteredTemplates.map((template) => (
              <article
                className={`template-card template-card-${template.id}`}
                key={template.id}
              >
                <div
                  className={`template-preview template-preview-${template.theme}`}
                >
                  <div className="template-preview-topbar">
                    <span className="template-preview-brand">
                      {template.name.split(" ")[0]}
                    </span>
                    <span className="template-preview-menu">☰</span>
                  </div>

                  <div className="template-preview-content">
                    <span className="template-preview-icon">
                      {template.icon}
                    </span>
                    <span className="template-preview-label">
                      PORTFOLIO
                    </span>
                    <h3>{template.role}</h3>
                    <p>{template.intro}</p>
                    <div className="template-preview-button">
                      Explore my work
                    </div>
                  </div>

                  <div className="template-preview-bottom">
                    <span />
                    <span />
                    <span />
                  </div>

                  <span className="template-category-badge">
                    {template.category}
                  </span>
                </div>

                <div className="template-card-body">
                  <div className="template-card-title-row">
                    <div>
                      <h3>{template.name}</h3>
                      <span className="template-profession">
                        {template.role}
                      </span>
                    </div>
                    <span className="template-card-icon" aria-hidden="true">
                      {template.icon}
                    </span>
                  </div>

                  <p className="template-description">
                    {template.description}
                  </p>

                  <div className="template-features">
                    <span>Hero</span>
                    <span>About</span>
                    <span>Projects</span>
                    <span>Contact</span>
                  </div>

                  <button
                    type="button"
                    className="use-template-btn"
                    disabled={Boolean(creatingId)}
                    onClick={() => handleUseTemplate(template)}
                  >
                    {creatingId === template.id
                      ? "Creating portfolio..."
                      : "Use this template"}
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="templates-footer">
        <p>
          PageCraft · Your work, your story, your portfolio.
        </p>
      </footer>
    </main>
  );
}
