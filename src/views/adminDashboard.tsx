import React from "react";
import View from "./view";
import { useNavigate } from "react-router-dom";
import NotFound from "./notFound";
import Button from "../components/button";
import { pizzaService } from "../service/service";
import {
  Franchise,
  FranchiseList,
  Role,
  Store,
  User,
} from "../service/pizzaService";
import { TrashIcon } from "../icons";

interface Props {
  user: User | null;
}

export default function AdminDashboard(props: Props) {
  const navigate = useNavigate();

  // --- Franchise State ---
  const [franchiseList, setFranchiseList] = React.useState<FranchiseList>({
    franchises: [],
    more: false,
  });
  const [franchisePage, setFranchisePage] = React.useState(0);
  const filterFranchiseRef = React.useRef<HTMLInputElement>(null);

  // --- Users State ---
  const [usersList, setUsersList] = React.useState<{
    users: User[];
    more: boolean;
  }>({
    users: [],
    more: false,
  });
  const [userPage, setUserPage] = React.useState(1);
  const [userFilter, setUserFilter] = React.useState("*");

  // --- Franchise Load ---
  const loadFranchises = async () => {
    const list = await pizzaService.getFranchises(franchisePage, 10, "*");
    setFranchiseList(list);
  };

  React.useEffect(() => {
    if (Role.isRole(props.user, Role.Admin)) {
      loadFranchises();
    }
  }, [props.user, franchisePage]);

  // --- Users Load ---
  const loadUsers = async () => {
    const list = await pizzaService.getUsers(userPage, 10, userFilter);
    setUsersList(list);
  };

  React.useEffect(() => {
    if (Role.isRole(props.user, Role.Admin)) {
      loadUsers();
    }
  }, [props.user, userPage, userFilter]);

  // --- User Actions ---
  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await pizzaService.deleteUser(userId);
    loadUsers();
  };

  // --- Navigation / Franchise Actions ---
  function createFranchise() {
    navigate("/admin-dashboard/create-franchise");
  }

  async function closeFranchise(franchise: Franchise) {
    navigate("/admin-dashboard/close-franchise", { state: { franchise } });
  }

  async function closeStore(franchise: Franchise, store: Store) {
    navigate("/admin-dashboard/close-store", { state: { franchise, store } });
  }

  async function filterFranchises() {
    const filterValue = `*${filterFranchiseRef.current?.value}*`;
    const list = await pizzaService.getFranchises(
      franchisePage,
      10,
      filterValue
    );
    setFranchiseList(list);
  }

  let response = <NotFound />;
  if (Role.isRole(props.user, Role.Admin)) {
    response = (
      <View title="Mama Ricci's kitchen">
        <div className="text-start py-8 px-4 sm:px-6 lg:px-8">
          {/* --- Franchises Section --- */}
          <h3 className="text-neutral-100 text-xl">Franchises</h3>
          <div className="bg-neutral-100 overflow-clip my-4">
            <div className="flex flex-col">
              <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="uppercase text-neutral-100 bg-slate-400 border-b-2 border-gray-500">
                        <tr>
                          {[
                            "Franchise",
                            "Franchisee",
                            "Store",
                            "Revenue",
                            "Action",
                          ].map((header) => (
                            <th
                              key={header}
                              className="px-6 py-3 text-center text-xs font-medium"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      {franchiseList.franchises.map((franchise, findex) => (
                        <tbody
                          key={findex}
                          className="divide-y divide-gray-200"
                        >
                          <tr className="border-neutral-500 border-t-2">
                            <td className="text-start px-2 whitespace-nowrap text-l font-mono text-orange-600">
                              {franchise.name}
                            </td>
                            <td
                              className="text-start px-2 whitespace-nowrap text-sm font-normal text-gray-800"
                              colSpan={3}
                            >
                              {franchise.admins?.map((o) => o.name).join(", ")}
                            </td>
                            <td className="px-6 py-1 whitespace-nowrap text-end text-sm font-medium">
                              <button
                                type="button"
                                className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-1 border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800"
                                onClick={() => closeFranchise(franchise)}
                              >
                                <TrashIcon /> Close
                              </button>
                            </td>
                          </tr>
                          {franchise.stores.map((store, sindex) => (
                            <tr key={sindex} className="bg-neutral-100">
                              <td
                                className="text-end px-2 whitespace-nowrap text-sm text-gray-800"
                                colSpan={3}
                              >
                                {store.name}
                              </td>
                              <td className="text-end px-2 whitespace-nowrap text-sm text-gray-800">
                                {store.totalRevenue?.toLocaleString()} ₿
                              </td>
                              <td className="px-6 py-1 whitespace-nowrap text-end text-sm font-medium">
                                <button
                                  type="button"
                                  className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-1 border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800"
                                  onClick={() => closeStore(franchise, store)}
                                >
                                  <TrashIcon /> Close
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      ))}
                      <tfoot>
                        <tr>
                          <td className="px-1 py-1">
                            <input
                              type="text"
                              ref={filterFranchiseRef}
                              placeholder="Filter franchises"
                              className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
                            />
                            <button
                              className="ml-2 px-2 py-1 text-sm font-semibold rounded-lg border border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800"
                              onClick={filterFranchises}
                            >
                              Submit
                            </button>
                          </td>
                          <td
                            colSpan={4}
                            className="text-end text-sm font-medium"
                          >
                            <button
                              className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300"
                              onClick={() =>
                                setFranchisePage(franchisePage - 1)
                              }
                              disabled={franchisePage <= 0}
                            >
                              «
                            </button>
                            <button
                              className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300"
                              onClick={() =>
                                setFranchisePage(franchisePage + 1)
                              }
                              disabled={!franchiseList.more}
                            >
                              »
                            </button>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- Users Section --- */}
          <h3 className="text-neutral-100 text-xl mt-10">Users</h3>
          <div className="bg-neutral-100 overflow-clip my-4">
            <div className="flex flex-col">
              <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="uppercase text-neutral-100 bg-slate-400 border-b-2 border-gray-500">
                        <tr>
                          {["Name", "Email", "Roles", "Action"].map(
                            (header) => (
                              <th
                                key={header}
                                className="px-6 py-3 text-center text-xs font-medium"
                              >
                                {header}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      {usersList.users.map((u, uindex) => (
                        <tbody
                          key={uindex}
                          className="divide-y divide-gray-200"
                        >
                          <tr className="border-t-2 border-gray-300">
                            <td className="px-6 py-2 text-start">{u.name}</td>
                            <td className="px-6 py-2 text-start">{u.email}</td>
                            <td className="px-6 py-2 text-start">
                              {u.roles?.map((r) => r.role).join(", ")}
                            </td>
                            <td className="px-6 py-2 text-end">
                              <button
                                type="button"
                                className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-1 border-red-400 text-red-400 hover:border-red-800 hover:text-red-800"
                                onClick={() => deleteUser(u.id!)}
                              >
                                <TrashIcon /> Delete
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      ))}
                      <tfoot>
                        <tr>
                          <td
                            colSpan={4}
                            className="text-end text-sm font-medium"
                          >
                            <button
                              className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300"
                              onClick={() =>
                                setUserPage((p) => Math.max(1, p - 1))
                              }
                              disabled={userPage <= 1}
                            >
                              «
                            </button>
                            <button
                              className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300"
                              onClick={() => setUserPage((p) => p + 1)}
                              disabled={!usersList.more}
                            >
                              »
                            </button>
                          </td>
                        </tr>
                      </tfoot>
                    </table>

                    <div className="mt-2 flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Filter users"
                        className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
                        onChange={(e) => setUserFilter(e.target.value || "*")}
                      />
                      <button
                        className="px-2 py-1 text-sm font-semibold rounded-lg border border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800"
                        onClick={() => setUserPage(1)}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Button
            className="w-36 text-xs sm:text-sm sm:w-64"
            title="Add Franchise"
            onPress={createFranchise}
          />
        </div>
      </View>
    );
  }

  return response;
}
