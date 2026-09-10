import { useEffect, useState } from "react";

import { Link, useLocation } from "react-router-dom";

import { AnimatePresence, motion } from "framer-motion";

import {
  Search,
  Menu,
  X,
  ChevronDown,
  Brain,
  Sparkles,
  ArrowRight,
  BookOpen,
  Target,
  Bot,
  BarChart3,
  Upload as UploadIcon,
  NotebookPen,
  Layers,
  Presentation,
  Activity,
  Languages,
} from "lucide-react";

function Navbar({ dashboard = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // ============================================================
  // MULTI-LANGUAGE SUPPORT
  // ============================================================
  const [language, setLanguage] = useState(
    localStorage.getItem("statwise_language") || "English",
  );

  const languages = [
    "English",
    "Hindi",
    "Telugu",
    "Tamil",
    "Kannada",
    "Malayalam",
    "Marathi",
    "Bengali",
  ];

  const handleLanguageChange = (selectedLanguage) => {
    setLanguage(selectedLanguage);

    localStorage.setItem(
      "statwise_language",
      selectedLanguage,
    );

    // Custom event so other React components can detect
    // the language change immediately.
    window.dispatchEvent(
      new CustomEvent("statwise-language-change", {
        detail: selectedLanguage,
      }),
    );
  };

  const location = useLocation();

  // ============================================================
  // MAIN NAVIGATION
  // ============================================================

  const navItems = dashboard
    ? [
        {
          name: "Dashboard",
          path: "/dashboard",
        },
        {
          name: "Learning",
          path: "/learning",
        },
        {
          name: "Skills",
          path: "/skills",
        },
        {
          name: "Assessments",
          path: "/assessments",
        },
        {
          name: "AI Tutor",
          path: "/tutor",
        },
        {
          name: "Digital Twin",
          path: "/digital-twin",
        },
      ]
    : [
        {
          name: "Home",
          path: "/",
        },
      ];

  // ============================================================
  // EXPLORE
  // ============================================================

  const exploreItems = [
    {
      title: "Learning Paths",
      description: "Personalized courses for your role",
      icon: BookOpen,
      path: "/learning",
    },
    {
      title: "Skill Intelligence",
      description: "Discover and close your skill gaps",
      icon: Target,
      path: "/skills",
    },
    {
      title: "AI Tutor",
      description: "Learn with your intelligent assistant",
      icon: Bot,
      path: "/tutor",
    },
    {
      title: "Assessments",
      description: "Measure your competency growth",
      icon: BarChart3,
      path: "/assessments",
    },
    {
      title: "Upload Learning Material",
      description: "Upload PDFs and learning materials",
      icon: UploadIcon,
      path: "/upload",
    },
    {
      title: "Generate Notes",
      description:
        "Transform learning material into smart AI notes",
      icon: NotebookPen,
      path: "/generate-notes",
    },
    {
      title: "AI Flashcards",
      description:
        "Flip, learn, remember & master concepts",
      icon: Layers,
      path: "/flashcards",
    },
    {
      title: "AI PPT Generator",
      description:
        "Turn PDF learning material into dynamic presentations",
      icon: Presentation,
      path: "/ppt-generator",
    },
    {
      title: "Digital Twin",
      description:
        "Simulate your skills, growth and future learning",
      icon: Brain,
      path: "/digital-twin",
    },
  ];

  // ============================================================
  // SEARCH ITEMS
  // ============================================================

  const searchItems = [
    {
      title: "Learning Paths",
      description:
        "Personalized learning recommendations",
      path: "/learning",
      icon: BookOpen,
    },
    {
      title: "Skill Intelligence",
      description:
        "Analyze your competency and skill gaps",
      path: "/skills",
      icon: Target,
    },
    {
      title: "Assessments",
      description:
        "Test and measure your knowledge",
      path: "/assessments",
      icon: BarChart3,
    },
    {
      title: "AI Tutor",
      description:
        "Ask questions and learn with AI",
      path: "/tutor",
      icon: Bot,
    },
    {
      title: "AI Flashcards",
      description:
        "Practice and remember concepts",
      path: "/flashcards",
      icon: Layers,
    },
  ];

  const filteredSearchItems = searchItems.filter(
    (item) =>
      item.title
        .toLowerCase()
        .includes(searchValue.toLowerCase()) ||
      item.description
        .toLowerCase()
        .includes(searchValue.toLowerCase()),
  );

  // ============================================================
  // ACTIVE LINK
  // ============================================================

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  // ============================================================
  // CLOSE MENUS
  // ============================================================

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setExploreOpen(false);
    setSearchOpen(false);
  };

  // ============================================================
  // CLOSE DROPDOWN WHEN ROUTE CHANGES
  // ============================================================

  useEffect(() => {
    setExploreOpen(false);
    setSearchOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50">
      {/* ========================================================
          TOP GOVERNMENT / PLATFORM BAR
      ======================================================== */}

      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#172033] text-white"
      >
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* LEFT */}

          <div className="flex items-center gap-2 text-[11px] font-medium">
            <motion.span
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
              }}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F4C430]/15"
            >
              <Sparkles
                size={11}
                className="text-[#F4C430]"
              />
            </motion.span>

            <span className="hidden sm:inline">
              AI-Powered Skill Intelligence Platform
            </span>

            <span className="sm:hidden">
              STATWISE AI
            </span>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-4 text-[11px] text-white/75 sm:gap-6">
            <button className="hidden transition hover:text-[#F6D76A] sm:block">
              Accessibility
            </button>

            <button className="hidden transition hover:text-[#F6D76A] sm:block">
              Help
            </button>

            {/* ==================================================
                MULTI-LANGUAGE SELECTOR
            ================================================== */}

            <div className="relative flex items-center">
              <Languages
                size={13}
                className="mr-1.5 text-[#F6D76A]"
              />

              <select
                value={language}
                onChange={(e) =>
                  handleLanguageChange(e.target.value)
                }
                className="cursor-pointer appearance-none bg-transparent pr-4 text-[11px] font-medium text-white/85 outline-none"
                aria-label="Select language"
              >
                {languages.map((lang) => (
                  <option
                    key={lang}
                    value={lang}
                    className="bg-[#172033] text-white"
                  >
                    {lang}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={11}
                className="pointer-events-none absolute right-0 text-white/60"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========================================================
          MAIN NAVBAR
      ======================================================== */}

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.5,
          delay: 0.05,
        }}
        className="border-b border-[#E1C75B] bg-[#F6D76A] shadow-[0_4px_20px_rgba(23,32,51,0.08)]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[76px] items-center justify-between">
            {/* ==================================================
                LOGO
            ================================================== */}

            <Link
              to="/"
              onClick={closeMobileMenu}
              className="group flex shrink-0 items-center gap-3"
            >
              <motion.div
                whileHover={{
                  scale: 1.06,
                  rotate: -2,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                }}
                className="relative flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#172033] shadow-md"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Brain
                    size={25}
                    strokeWidth={2.2}
                    className="text-[#F6D76A]"
                  />
                </motion.div>

                <motion.span
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm"
                >
                  <Sparkles
                    size={8}
                    className="text-[#C28A00]"
                  />
                </motion.span>
              </motion.div>

              <div className="leading-none">
                <div className="text-[20px] font-black tracking-tight text-[#172033]">
                  STATWISE
                  <span className="ml-1 text-[#9A6900]">
                    AI
                  </span>
                </div>

                <div className="mt-1.5 text-[8px] font-bold uppercase tracking-[0.22em] text-[#665313]">
                  Skill Intelligence
                </div>
              </div>
            </Link>

            {/* ==================================================
                DESKTOP NAVIGATION
            ================================================== */}

            <nav className="hidden items-center gap-1 xl:flex">
              {navItems.map((item) => {
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`relative rounded-xl px-3.5 py-2.5 text-[13px] font-bold transition-all duration-300 ${
                      active
                        ? "bg-[#172033] text-white shadow-md"
                        : "text-[#263246] hover:bg-[#FFE9A6] hover:text-[#172033]"
                    }`}
                  >
                    {item.name}

                    {active && (
                      <motion.span
                        layoutId="navbar-active"
                        className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#F6D76A]"
                      />
                    )}
                  </Link>
                );
              })}

              {/* ==================================================
                  EXPLORE
              ================================================== */}

              {dashboard && (
                <div className="relative">
                  <motion.button
                    whileTap={{
                      scale: 0.96,
                    }}
                    onClick={() =>
                      setExploreOpen((prev) => !prev)
                    }
                    className={`group ml-1 flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[13px] font-bold transition-all duration-300 ${
                      exploreOpen
                        ? "bg-[#FFE9A6] text-[#172033]"
                        : "text-[#263246] hover:bg-[#FFE9A6]"
                    }`}
                  >
                    Explore

                    <motion.div
                      animate={{
                        rotate: exploreOpen ? 180 : 0,
                      }}
                    >
                      <ChevronDown size={15} />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {exploreOpen && (
                      <>
                        {/* BACKDROP */}

                        <motion.div
                          initial={{
                            opacity: 0,
                          }}
                          animate={{
                            opacity: 1,
                          }}
                          exit={{
                            opacity: 0,
                          }}
                          className="fixed inset-0 -z-10"
                          onClick={() =>
                            setExploreOpen(false)
                          }
                        />

                        {/* DROPDOWN */}

                        <motion.div
                          initial={{
                            opacity: 0,
                            y: -10,
                            scale: 0.97,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            y: -10,
                            scale: 0.97,
                          }}
                          transition={{
                            duration: 0.2,
                          }}
                          className="absolute right-0 top-[52px] w-[360px] overflow-hidden rounded-2xl border border-[#ead58b] bg-white p-2 shadow-[0_20px_50px_rgba(23,32,51,0.18)]"
                        >
                          {/* HEADER */}

                          <div className="border-b border-gray-100 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Activity
                                size={15}
                                className="text-[#9A6900]"
                              />

                              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#9A6900]">
                                Explore STATWISE AI
                              </p>
                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                              Everything you need to grow your skills.
                            </p>
                          </div>

                          {/* ITEMS */}

                          <div className="mt-1 max-h-[440px] overflow-y-auto">
                            {exploreItems.map(
                              (item, index) => {
                                const Icon = item.icon;
                                const active = isActive(
                                  item.path,
                                );

                                return (
                                  <motion.div
                                    key={`${item.title}-${index}`}
                                    initial={{
                                      opacity: 0,
                                      x: -8,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      x: 0,
                                    }}
                                    transition={{
                                      delay:
                                        index * 0.035,
                                    }}
                                  >
                                    <Link
                                      to={item.path}
                                      onClick={() =>
                                        setExploreOpen(
                                          false,
                                        )
                                      }
                                      className={`group flex items-center gap-3 rounded-xl p-3 transition-all duration-200 ${
                                        active
                                          ? "bg-[#FFF3B0]"
                                          : "hover:bg-[#FFF8D9]"
                                      }`}
                                    >
                                      <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#9A6900] transition ${
                                          active
                                            ? "bg-[#F6D76A]"
                                            : "bg-[#FFF3B0] group-hover:bg-[#F6D76A]"
                                        }`}
                                      >
                                        <Icon size={19} />
                                      </div>

                                      <div className="flex-1">
                                        <p className="text-sm font-bold text-[#172033]">
                                          {item.title}
                                        </p>

                                        <p className="mt-0.5 text-[11px] leading-4 text-gray-500">
                                          {item.description}
                                        </p>
                                      </div>

                                      <ArrowRight
                                        size={15}
                                        className="text-gray-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#172033]"
                                      />
                                    </Link>
                                  </motion.div>
                                );
                              },
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </nav>

            {/* ==================================================
                RIGHT SIDE
            ================================================== */}

            <div className="hidden items-center gap-2 xl:flex">
              {/* SEARCH */}

              <motion.button
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                onClick={() =>
                  setSearchOpen((prev) => !prev)
                }
                aria-label="Search"
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                  searchOpen
                    ? "bg-[#172033] text-white"
                    : "text-[#263246] hover:bg-[#FFE9A6]"
                }`}
              >
                <Search size={19} />
              </motion.button>

              {/* LOGIN */}

              <Link
                to="/login"
                className="rounded-xl px-4 py-2.5 text-[13px] font-bold text-[#172033] transition-all duration-300 hover:bg-[#FFE9A6]"
              >
                Login
              </Link>

              {/* START LEARNING */}

              <Link
                to="/signup"
                className="group flex items-center gap-2 rounded-xl bg-[#172033] px-5 py-3 text-[13px] font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#263653] hover:shadow-xl"
              >
                Start Learning

                <ArrowRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>

            {/* ==================================================
                MOBILE BUTTON
            ================================================== */}

            <motion.button
              whileTap={{
                scale: 0.9,
              }}
              onClick={() =>
                setMobileOpen((prev) => !prev)
              }
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#172033] text-[#F6D76A] shadow-md xl:hidden"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{
                      rotate: -90,
                      opacity: 0,
                    }}
                    animate={{
                      rotate: 0,
                      opacity: 1,
                    }}
                    exit={{
                      rotate: 90,
                      opacity: 0,
                    }}
                  >
                    <X size={22} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{
                      rotate: 90,
                      opacity: 0,
                    }}
                    animate={{
                      rotate: 0,
                      opacity: 1,
                    }}
                    exit={{
                      rotate: -90,
                      opacity: 0,
                    }}
                  >
                    <Menu size={22} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* ======================================================
              DESKTOP SEARCH
          ====================================================== */}

          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0,
                }}
                animate={{
                  height: "auto",
                  opacity: 1,
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                }}
                className="hidden overflow-hidden border-t border-[#DFC35A] xl:block"
              >
                <div className="relative py-3">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) =>
                      setSearchValue(e.target.value)
                    }
                    placeholder="Search for learning content, skills, courses..."
                    autoFocus
                    className="h-12 w-full rounded-xl border border-[#E4CE70] bg-white pl-11 pr-4 text-sm text-[#172033] outline-none transition focus:border-[#172033] focus:ring-2 focus:ring-[#172033]/10"
                  />

                  {/* SEARCH RESULTS */}

                  {searchValue.trim() !== "" && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -5,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="absolute left-0 right-0 top-[68px] z-50 rounded-2xl border border-[#E7DFAF] bg-white p-2 shadow-xl"
                    >
                      {filteredSearchItems.length > 0 ? (
                        filteredSearchItems.map(
                          (item) => {
                            const Icon = item.icon;

                            return (
                              <Link
                                key={item.title}
                                to={item.path}
                                onClick={() => {
                                  setSearchOpen(false);
                                  setSearchValue("");
                                }}
                                className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-[#FFF8D9]"
                              >
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF3B0] text-[#9A6900]">
                                  <Icon size={17} />
                                </div>

                                <div>
                                  <p className="text-sm font-bold text-[#172033]">
                                    {item.title}
                                  </p>

                                  <p className="text-[11px] text-gray-500">
                                    {item.description}
                                  </p>
                                </div>
                              </Link>
                            );
                          },
                        )
                      ) : (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No matching learning content found.
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ======================================================
              MOBILE MENU
          ====================================================== */}

          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0,
                }}
                animate={{
                  height: "auto",
                  opacity: 1,
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                }}
                className="overflow-hidden border-t border-[#DFC35A] xl:hidden"
              >
                <nav className="flex flex-col gap-1 py-4">
                  {/* MAIN NAV */}

                  {navItems.map((item) => {
                    const active = isActive(item.path);

                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={closeMobileMenu}
                        className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                          active
                            ? "bg-[#172033] text-white"
                            : "text-[#263246] hover:bg-[#FFE9A6]"
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}

                  {/* MOBILE EXPLORE */}

                  {dashboard && (
                    <>
                      <button
                        onClick={() =>
                          setExploreOpen(
                            (prev) => !prev,
                          )
                        }
                        className="flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-bold text-[#263246] transition hover:bg-[#FFE9A6]"
                      >
                        <span>
                          Explore
                        </span>

                        <motion.div
                          animate={{
                            rotate: exploreOpen
                              ? 180
                              : 0,
                          }}
                        >
                          <ChevronDown size={16} />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {exploreOpen && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              height: 0,
                            }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                            }}
                            exit={{
                              opacity: 0,
                              height: 0,
                            }}
                            className="ml-2 overflow-hidden rounded-xl bg-[#FFF8D9] p-2"
                          >
                            {exploreItems.map(
                              (item, index) => {
                                const Icon =
                                  item.icon;

                                return (
                                  <motion.div
                                    key={`${item.title}-mobile-${index}`}
                                    initial={{
                                      opacity: 0,
                                      x: -8,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      x: 0,
                                    }}
                                    transition={{
                                      delay:
                                        index * 0.03,
                                    }}
                                  >
                                    <Link
                                      to={item.path}
                                      onClick={
                                        closeMobileMenu
                                      }
                                      className="flex items-center gap-3 rounded-lg p-3 transition hover:bg-[#FFE9A6]"
                                    >
                                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF3B0] text-[#9A6900]">
                                        <Icon size={17} />
                                      </div>

                                      <div>
                                        <span className="block text-sm font-semibold text-[#172033]">
                                          {
                                            item.title
                                          }
                                        </span>

                                        <span className="block text-[10px] text-gray-500">
                                          {
                                            item.description
                                          }
                                        </span>
                                      </div>
                                    </Link>
                                  </motion.div>
                                );
                              },
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}

                  {/* MOBILE SEARCH */}

                  <div className="mt-2 border-t border-[#DFC35A] pt-3">
                    <div className="relative">
                      <Search
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                      />

                      <input
                        type="text"
                        value={searchValue}
                        onChange={(e) =>
                          setSearchValue(
                            e.target.value,
                          )
                        }
                        placeholder="Search courses & skills..."
                        className="h-11 w-full rounded-xl border border-[#E4CE70] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#172033]"
                      />
                    </div>

                    {searchValue.trim() !== "" && (
                      <div className="mt-2 rounded-xl bg-white p-2 shadow-sm">
                        {filteredSearchItems.map(
                          (item) => {
                            const Icon = item.icon;

                            return (
                              <Link
                                key={item.title}
                                to={item.path}
                                onClick={
                                  closeMobileMenu
                                }
                                className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-[#FFF8D9]"
                              >
                                <Icon
                                  size={17}
                                  className="text-[#9A6900]"
                                />

                                <span className="text-xs font-semibold">
                                  {item.title}
                                </span>
                              </Link>
                            );
                          },
                        )}
                      </div>
                    )}
                  </div>

                  {/* ==================================================
                      MOBILE LANGUAGE SELECTOR
                  ================================================== */}

                  <div className="mt-2 border-t border-[#DFC35A] pt-3">
                    <div className="flex items-center gap-3 rounded-xl bg-[#FFF8D9] px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F6D76A] text-[#9A6900]">
                        <Languages size={18} />
                      </div>

                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-wide text-[#9A6900]">
                          Learning Language
                        </p>

                        <select
                          value={language}
                          onChange={(e) =>
                            handleLanguageChange(
                              e.target.value,
                            )
                          }
                          className="mt-1 w-full cursor-pointer bg-transparent text-sm font-bold text-[#172033] outline-none"
                        >
                          {languages.map((lang) => (
                            <option
                              key={lang}
                              value={lang}
                            >
                              {lang}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* MOBILE AUTH */}

                  <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#DFC35A] pt-3">
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="rounded-xl border-2 border-[#172033] px-4 py-3 text-center text-sm font-bold text-[#172033] transition hover:bg-[#FFE9A6]"
                    >
                      Login
                    </Link>

                    <Link
                      to="/signup"
                      onClick={closeMobileMenu}
                      className="rounded-xl bg-[#172033] px-4 py-3 text-center text-sm font-bold text-white shadow-md transition hover:bg-[#263653]"
                    >
                      Start Learning
                    </Link>
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </header>
  );
}

export default Navbar;