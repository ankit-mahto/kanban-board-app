import React, { useEffect, useState, useRef } from "react";
import './Main.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList,faChevronDown ,faCircle, faDotCircle,faCircleExclamation,faBars ,faPlus,faCircleDown,faCircleNotch,faCircleHalfStroke,faCircleCheck,faCircleXmark} from "@fortawesome/free-solid-svg-icons";
import profile from './Assets/profile.jpg'



const priorityLevels = {
  0: "No priority",
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Urgent",
};
const dp ={
  0: <img className="circle" src={profile} alt="" srcSet="" />
}
const statusIcons = {
  'Backlog': <FontAwesomeIcon icon={faCircleDown} style={{color: "#808080",}} />, // Add appropriate icon class or image URL for each status
  'Todo': <FontAwesomeIcon icon={faCircleNotch} style={{color: "#9e9e9e",}} />, 
  'In progress': <FontAwesomeIcon icon={faCircleHalfStroke} style={{color: "#828282",}} />,
  'Done': <FontAwesomeIcon icon={faCircleCheck} style={{color: "#707070",}} />,
  'Cancelled': <FontAwesomeIcon icon={faCircleXmark} style={{color: "#878787",}} />,
};
// const FeatureRequestIcon = () => {
//   return (
    // <FontAwesomeIcon
    //   icon={faFeatureRequest}
    //   style={{ fontSize: 20, marginRight: 10 }}
    // />
//   );
// };
const apiURL = "https://api.quicksell.co/v1/internal/frontend-assignment";

function Main() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [groupingOption, setGroupingOption] = useState("status");
  const [sortingOption, setSortingOption] = useState("priority");
  const [users, setUsers] = useState([]);
  const [originalTickets, setOriginalTickets] = useState([]);
  const [selectedGroupingOption, setSelectedGroupingOption] = useState("status");
  const [error, setError] = useState(null); // State for error message
  const [temporarySortingOption, setTemporarySortingOption] = useState(sortingOption);

  // Save the user's selected options to localStorage
  const saveUserViewState = (groupingOption, sortingOption) => {
    localStorage.setItem("userViewState", JSON.stringify({ groupingOption, sortingOption }));
  };

  // Inside the useEffect for fetching data, you should set the options only if they are not already set
  useEffect(() => {
    fetch(apiURL)
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        setTickets(data.tickets);
        setUsers(data.users);
        setOriginalTickets(data.tickets);
 
        // Initialize user's view state from localStorage if available

        const savedUserViewState = localStorage.getItem("userViewState");

        if (savedUserViewState) {
          const { groupingOption, sortingOption } = JSON.parse(savedUserViewState);
          // console.log(groupingOption)
          // console.log(sortingOption)
          setGroupingOption(groupingOption);

          setSortingOption(sortingOption);

          // Apply the grouping and sorting options based on what's in local storage
          groupTickets(groupingOption);

        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Error fetching data: " + error.message);
      });// eslint-disable-next-line
  }, [groupingOption, sortingOption]);

// Function to count the number of items in each group
const countItemsInGroup = (groupedTickets) => {
  const counts = {};

  for (const key in groupedTickets) {
    counts[key] = groupedTickets[key].length;
  }

  return counts;
};
const groupCounts = countItemsInGroup(tickets);
  const groupTickets = (selectedOption) => {
    const copyOfOriginalTickets = [...originalTickets];
    let groupedTickets = [];

    if (selectedOption === "status") {
      groupedTickets = groupByStatus(copyOfOriginalTickets);
    } else if (selectedOption === "user") {
      groupedTickets = groupByUser(copyOfOriginalTickets);
    } else if (selectedOption === "priority") {
      groupedTickets = groupByPriority(copyOfOriginalTickets);
    }

    sortTickets(groupedTickets);
  };

  const groupByStatus = (ticketsToGroup) => {
    const groupedByStatus = {};

    ticketsToGroup.forEach((ticket) => {
      const status = ticket.status;
      if (!groupedByStatus[status]) {
        groupedByStatus[status] = [];
      }
      groupedByStatus[status].push(ticket);
    });

    return groupedByStatus;
  };
  

  const groupByUser = (ticketsToGroup) => {
    const groupedByUser = {};

    ticketsToGroup.forEach((ticket) => {
      const userId = ticket.userId;
      const userName = getUserInfo(userId); // Get the user's name
      if (!groupedByUser[userName]) {
        groupedByUser[userName] = [];
      }
      groupedByUser[userName].push(ticket);
    });

    return groupedByUser;
  };

  const desiredPriorityOrder = ["Urgent", "High", "Medium", "Low", "No priority"];

const groupByPriority = (ticketsToGroup) => {
  const groupedByPriority = {};

  // Initialize the groupedByPriority object with empty arrays
  desiredPriorityOrder.forEach((priority) => {
    groupedByPriority[priority] = [];
  });

  ticketsToGroup.forEach((ticket) => {
    const priority = ticket.priority;
    const priorityName = priorityLevels[priority];
    groupedByPriority[priorityName].push(ticket);
  });

  return groupedByPriority;
};

  // const sortTickets = (groupedTickets) => {
  //   if (sortingOption === "priority") {
  //     for (const key in groupedTickets) {
  //       groupedTickets[key].sort((a, b) => a.priority - b.priority);
  //     }
  //   } else if (sortingOption === "title") {
  //     for (const key in groupedTickets) {
  //       groupedTickets[key].sort((a, b) => a.title.localeCompare(b.title));
  //     }
  //   }

  //   setTickets(groupedTickets);
  // };
  const sortTickets = (groupedTickets) => {
    const sortedGroups = { ...groupedTickets };
  
    for (const key in sortedGroups) {
      if (sortingOption === "priority") {
        sortedGroups[key].sort((a, b) => b.priority - a.priority); // Sort in descending order
      } else if (sortingOption === "title") {
        sortedGroups[key].sort((a, b) => a.title.localeCompare(b.title));
      }
    }
  
    setTickets(sortedGroups);
  };
  
  

  const getUserInfo = (userId) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.name : "User Not Found";
  };
   // Helper function to get the user's availability icon
   const getUserAvailabilityIcon = (userId) => {
    const user = users.find((user) => user.id === userId);
    if (user) {
      return user.available ? (
        <FontAwesomeIcon icon={faCircle} style={{ color: "green", fontSize: 12 }} />
      ) : (
        <FontAwesomeIcon icon={faDotCircle} style={{ color: "gray", fontSize: 12 }} />
      );
    }
    return null;
  };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  const handleGroupingOptionChange = (e) => {
    const newGroupingOption = e.target.value;
    setSelectedGroupingOption(newGroupingOption);
  };

  const handleSortingOptionChange = (e) => {
    const newSortingOption = e.target.value;
    // Update the temporary sorting option
    setTemporarySortingOption(newSortingOption);
  };
  
  const applyGroupingOption = () => {
    setGroupingOption(selectedGroupingOption);
    // Apply the temporary sorting option when clicking "Apply"
    setSortingOption(temporarySortingOption);
    // Save the user's selected options to localStorage
    saveUserViewState(selectedGroupingOption, temporarySortingOption);
    groupTickets(selectedGroupingOption);
    closeDropdown();
  };
// Function to truncate text to the first 20 words and add "..."

const truncateText = (text) => {
  if (text.length > 30) {
    return text.slice(0, 27) + "...";
  }
  return text;
};
  // const resetOptions = () => {
  //   setSelectedGroupingOption(groupingOption);
  //   setSortingOption("priority");
  //   setOriginalTickets(originalTickets);
  //   closeDropdown();
  // };

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="kanban-board">
     <div className="top-navbar">
        {isDropdownOpen && (
          <div className="dropdown-content left" ref={dropdownRef}>
            <div style={{display:"flex"}}>
              <h3>Grouping</h3>
              {/* <FontAwesomeIcon icon={faExclamationTriangle} /> */}
              <select
                value={selectedGroupingOption}
                onChange={handleGroupingOptionChange}
              >
                <option value="status">By Status</option>
                <option value="user">By User</option>
                <option value="priority">By Priority</option>
              </select>
            </div>
            <div style={{display:"flex"}} >
              <h3>Sorting</h3>
              <select value={temporarySortingOption} onChange={handleSortingOptionChange}>

                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>
            <button onClick={applyGroupingOption} style={{backgroundColor: "#444"}}><h3>Apply</h3></button>
            {/* <button onClick={resetOptions}>Reset</button> */}
          </div>
        )}
       
        <button onClick={toggleDropdown} className="display-button" style={{border: "1px solid whitesmoke" , boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19)"}}>
        <FontAwesomeIcon icon={faList} style={{ fontSize: 20, marginRight: 10 }} />Display Menu
        <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 20, marginLeft: 6 }}/>
        </button>
        
      </div>
      {/* Navbar ends */}
      <div className="board">
      {error ? (
          // Display an error message when there's an error
          <h1>{error}</h1>
        ) :
        Array.isArray(tickets) ? (
          tickets.map((ticket) => (
            groupingOption === "user" ? (
              <div className="card" key={ticket.id}>
                <div className="card-header">
                  <h3 className="card-title">
                    {getUserInfo(ticket.userId)}
                  </h3>
                </div>
                <div className="card-body">
                  <p>{truncateText(ticket.title)}</p>
                </div>
                <div className="card-footer">
               <button className="round-Button">
                 <FontAwesomeIcon icon={faCircleExclamation} style={{"--fa-primary-opacity": "0", "--fa-secondary-opacity": "0.4",}} />  
                </button>
               <button className="round-Button1">
                 {ticket.tag[0]}
                </button> 
                </div>
              </div>
            ) : (
              <div className="card" key={ticket.id}>
                  <div className="card-header">
                    <h3 className="card-title">
                      <div style={{width: '81px'}}>
                        {ticket.id}
                        </div>
                      <div>
                      <img className="circle" src={profile} alt="" srcSet="" />
                      {getUserAvailabilityIcon(ticket.userId)}
                        </div>
                    </h3>
                    
                  </div>
                  <div className="card-body"><p>{truncateText(ticket.title)}</p></div>
                  <div className="card-footer">
                  <button className="round-Button">
                 <FontAwesomeIcon icon={faCircleExclamation} style={{"--fa-primary-opacity": "0", "--fa-secondary-opacity": "0.4",}} />  
                </button>
               <button className="round-Button1">
                 {ticket.tag[0]}
                </button> 
                  </div>
                  {/* <div className="priority">{ticket.priority}</div> */}
                  {groupingOption === "user" && (
                    <div className="user">
                      User: {getUserInfo(ticket.userId)}
                    </div>
                  )}
                </div>
            )
            
          ))
        ) : (
          
          Object.keys(groupCounts).map((groupKey) => (
            <div key={groupKey}>
              <div className="main-header">
              {groupingOption === "status" ?  ( <>
               <div style={{display:"flex",alignItems:'baseline',width: '128px', flexDirection: 'row',  justifyContent: 'space-between'}}>
                <> {statusIcons[groupKey]}</>
                <> <h3>{groupKey}</h3></>
                <>{groupCounts[groupKey]}</>
                </div>
                <div style={{display:"flex"}}>
                <FontAwesomeIcon icon={faPlus} style={{color: "#919191",margin:'5px'}} />
                  <FontAwesomeIcon icon={faBars} style={{color: "#8c8c8c",margin:'5px'}} />
                  </div>
              </>
                ):
                groupingOption === "user" ? (
                 
                  
                    <div style={{    display: 'flex', alignItems: 'center', width: '214px', justifyContent: 'space-around', flexDirection: 'row'}}>
                  {/* <img style={{height:'10px',width:'10px',borderRadius:'10px'}} src="" alt="profile" srcSet="" /> */}
                  {getUserAvailabilityIcon(groupKey.userId)}
                  <>
                           {dp[0]}
                           </> <h3>
                            {groupKey}
                            </h3> <>{groupCounts[groupKey]}</>
                          
                          
                       
                   
                    </div>    
                ) :
                  groupingOption === "priority" ?   (<><h3>{groupKey}</h3> <>{groupCounts[groupKey]}</> </>): groupKey
              }
            </div>
              {tickets[groupKey].map((ticket) => (
                 groupingOption === "user" ? (
                  <div className="card" key={ticket.id}>
                    <div className="card-header">
                      <h3 className="card-title">
                      <div style={{width: '81px'}}>
                        {ticket.id}
                        </div>
                      </h3>
                    </div>
                    <div className="card-body">
                      <p>{truncateText(ticket.title)}</p>
                    </div>
                    <div className="card-footer">
                    <button className="round-Button">
                 <FontAwesomeIcon icon={faCircleExclamation} style={{"--fa-primary-opacity": "0", "--fa-secondary-opacity": "0.4",}} />  
                </button>
               <button className="round-Button1">
                 {ticket.tag[0]}
                </button> 
                    </div>
                  </div>
                ) : (
                  <div className="card" key={ticket.id}>
                      <div className="card-header">
                        <h3 className="card-title">
                        <div style={{width: '81px'}}>
                        {ticket.id}
                        </div>
                          <div>
                            <img className="circle" src={profile} alt="" srcSet="" />
                          {getUserAvailabilityIcon(ticket.userId)}
                            </div>
                        </h3>
                        
                      </div>
                      <div className="card-body"><p>{truncateText(ticket.title)}</p></div>
                      <div className="card-footer">
                      <button className="round-Button">
                 <FontAwesomeIcon icon={faCircleExclamation} style={{"--fa-primary-opacity": "0", "--fa-secondary-opacity": "0.4",}} />  
                </button>
               <button className="round-Button1">
                 {ticket.tag[0]}
                </button> 
                      </div>
                      {/* <div className="priority">{ticket.priority}</div> */}
                      {groupingOption === "user" && (
                        <div className="user">
                          User: {getUserInfo(ticket.userId)}
                        </div>
                      )}
                    </div>
                )
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Main;