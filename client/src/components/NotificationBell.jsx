import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DropdownMenu from "./userProfile/DropdownMenu";

const lst = [
  {
    user: "user1",
    msg: "message1",
  },
  {
    user: "user2",
    msg: "message2",
  },
  {
    user: "user3",
    msg: "message3",
  },
];

const NotificationBell = () => {
  const renderNotificationItem = (item) => (
    <div className="text-white px-4 py-2 hover:bg-neutral-700">
      <p className="font-bold">{item.user}</p>
      <p>{item.msg}</p>
    </div>
  );

  return (
    <DropdownMenu menuItems={lst} renderItem={renderNotificationItem}>
      <FontAwesomeIcon icon={faBell} className="text-white text-2xl p-3" />
    </DropdownMenu>
  );
};

export default NotificationBell;
