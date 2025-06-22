"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  CalenderIcon,
  ChatIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PlugInIcon,
  TaskIcon,
  UserCircleIcon,
} from "../icons/index";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import axios from "axios";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  count? : boolean ;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};


const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/admin"
  },
  {
    icon: <ListIcon />,
    name: "Orders",
    path: "/admin/orders",
  },
  {
    name: "Manage",
    icon: <TaskIcon />,
    subItems: [{ name: "Products & Categories", path: "/admin/products" },
    { name: "Delivery settings", path: '/admin/delivery-settings' },
    {name : "Offers & Code promo" , path  : "/admin/offers"},
    ],
  },
  {
    icon: <ChatIcon />,
    name: "Messages",
    path: "/admin/messages",
    count : true
  },
  // {
  //   icon: <CalenderIcon />,
  //   name: "Calendar",
  //   path: "/admin/calendar",
  // },
];

const navAdminItems: NavItem[] = [
  {
    icon: <ListIcon />,
    name: "Orders",
    path: "/admin/orders",
  },
  {
    name: "Manage",
    icon: <TaskIcon />,
    subItems: [{ name: "Products & Categories", path: "/admin/products" },
    { name: "Delivery settings", path: '/admin/delivery-settings' },
    {name : "Offers & Code promo" , path  : "/admin/offers"},
    ],
  },
  {
    icon: <ChatIcon />,
    name: "Messages",
    path: "/admin/messages",
    count : true
  },
  // {
  //   icon: <CalenderIcon />,
  //   name: "Calendar",
  //   path: "/admin/calendar",
  // },
];

const navManagerItems: NavItem[] = [
  {
    icon: <ListIcon />,
    name: "Orders",
    path : "/admin/orders"
  },
  // {
  //   icon: <CalenderIcon />,
  //   name: "Calendar",
  //   path: "/admin/calendar",
  // },
]

const othersItems: NavItem[] = [
  {
    icon: <UserCircleIcon />,
    name: "Accounts",
    path: "/admin/accounts",
  },
  {
    icon: <PlugInIcon />,
    name: "Add Admin",
    path : "/admin/register"
  },
];


const AppSidebar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [unseenCount, setUnseenCount] = useState<number>(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/messages/unseen/count`, { withCredentials: true });
        setUnseenCount(res.data.unseenCount || 0);
      } catch (error) {
        setUnseenCount(0);
      }
    };
    fetchCount();
    // Optionally poll every 30s:
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`relative ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                {nav.count&& unseenCount > 0 && <span className="absolute top-0 left-2 bg-brand-500 rounded-full h-4 w-4 font-semibold flex items-center justify-center ">{unseenCount}</span>}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/admin">
          {isExpanded || isHovered || isMobileOpen ?
            //   <>
            //     <Image
            //       className="dark:hidden"
            //       src="/images/logo/logo.svg"
            //       alt="Logo"
            //       width={150}
            //       height={40}
            //     />
            //     <Image
            //       className="hidden dark:block"
            //       src="/images/logo/logo-dark.svg"
            //       alt="Logo"
            //       width={150}
            //       height={40}
            //     />
            //   </>
            // ) : (
            //   <Image
            //     src="/images/logo/logo-icon.svg"
            //     alt="Logo"
            //     width={32}
            //     height={32}
            //   />
            // )}
            <h3 className="text-3xl font-bold text-black dark:text-white">Devali</h3>
            :
            <h3 className="text-xl font-semibold">Devali</h3>}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {user && user.role === 'super' ? renderMenuItems(navItems, "main") : user?.role === 'sub-super' ? renderMenuItems(navAdminItems , 'main') : renderMenuItems(navManagerItems, "main")}
            </div>


            {user && user.role === 'super' && <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {user.role === 'super' && renderMenuItems(othersItems, "others")}
            </div>}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
