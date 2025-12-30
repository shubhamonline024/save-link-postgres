import React, { useState, useEffect } from "react";
import api from "../../../axios-private/AxiosPrivate";
import { useAuth } from "../../../auth/AuthProvider";
import useStore from "../../../store/store";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { X } from "lucide-react";
import { Trash2 } from "lucide-react";
import { Pencil } from "lucide-react";

const UrlsTable = () => {
  const { userId } = useAuth();
  const { urlStore, setUrlStore, setIsAction } = useStore();
  const [newRows, setNewRows] = useState([]);

  const fetchData = async () => {
    const response = await api.get(`/api/data?id=${userId}`);
    const newData = response.data.data?.map((row) => ({
      ...row,
      isAction: "",
    }));
    setUrlStore(newData);
  };

  const handleAdd = () => {
    const newRow = {
      id: newRows.length + 1,
      url: "",
      created_at: "",
      updated_at: "",
      isAction: "add",
    };
    setNewRows((prev) => [...prev, newRow]);
  };

  const handleAction = async (id, url, action) => {
    if (action === "add") {
      try {
        const payload = {
          id: userId,
          urls: newRows.map((row) => row.url),
        };

        const response = await api.post(`/api/data`, payload);
        if (response.status === 201) {
          fetchData();
          setNewRows([]);
          toast(response.data.message);
        }
      } catch (e) {
        toast(e.response.data.message);
      }
    } else if (action === "edit") {
      try {
        const payload = {
          id: userId,
          url: url,
          url_id: id,
        };

        const response = await api.patch(`/api/data`, payload);
        if (response.status === 200) {
          const newData = urlStore?.map((row) => {
            if (row.id === id) {
              const newrow = { ...row };

              newrow.url = url;
              newrow.isAction = "";
              return newrow;
            }
            return row;
          });
          setUrlStore(newData);
          toast(response.data.message);
        }
      } catch (e) {
        toast(e.response.data.message);
      }
    } else {
      try {
        const payload = {
          id: userId,
          url_id: id,
        };

        const response = await api.delete(`/api/data`, { data: payload });
        if (response.status === 200) {
          fetchData();
          toast(response.data.message);
        }
      } catch (e) {
        toast(e.response.data.message);
      }
    }
  };

  const handleInputChange = (id, url, action, e) => {
    if (action === "add") {
      setNewRows((prev) => {
        const newData = prev.map((row) => {
          if (row.id === id) {
            const newrow = { ...row };

            newrow.url = e.target.value;
            return newrow;
          }
          return row;
        });

        return newData;
      });
    } else {
      const newData = urlStore?.map((row) => {
        if (row.id === id) {
          const newrow = { ...row };

          newrow.url = e.target.value;
          return newrow;
        }
        return row;
      });
      setUrlStore(newData);
    }
  };

  const getTableUrl = (id, url, action) => {
    if (action === "add" || action === "edit") {
      return (
        <Input
          type="text"
          name="url"
          placeholder="Enter Url"
          value={url}
          onChange={(e) => {
            handleInputChange(id, url, action, e);
          }}
        />
      );
    } else {
      return url;
    }
  };

  const getTableCell = (action, id, idx, position, url) => {
    if (position === "first") {
      if (action === "") {
        return (
          <Button
            variant="default"
            onClick={() => {
              setIsAction(id, "edit");
            }}
          >
            <Pencil />
          </Button>
        );
      } else if (
        action === "edit" ||
        action === "delete" ||
        (action === "add" && idx === 0)
      ) {
        return (
          <Button
            variant="default"
            onClick={() => {
              handleAction(id, url, action);
            }}
          >
            <Check />
          </Button>
        );
      }
    } else {
      if (action === "") {
        return (
          <Button
            variant="default"
            onClick={() => {
              setIsAction(id, "delete");
            }}
          >
            <Trash2 />
          </Button>
        );
      } else if (
        action === "edit" ||
        action === "delete" ||
        (action === "add" && idx === 0)
      ) {
        return (
          <Button
            variant="default"
            onClick={() => {
              if (action === "add") {
                setNewRows([]);
              }
              setIsAction(id, "");
            }}
          >
            <X />
          </Button>
        );
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-120">
      <div className="flex justify-end my-2 w-4/5">
        <Button
          variant="default"
          onClick={() => {
            handleAdd();
          }}
        >
          Add
        </Button>
      </div>
      <div className="w-4/5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead colSpan={2}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {newRows?.map((row, idx) => (
              <TableRow key={idx}>
                <TableHead>{idx + 1}</TableHead>
                <TableCell>
                  {getTableUrl(row.id, row.url, row.isAction)}
                </TableCell>
                <TableCell>{row.created_at}</TableCell>
                <TableCell>{row.updated_at}</TableCell>
                <TableCell>
                  {getTableCell(row.isAction, row.id, idx, "first")}
                </TableCell>
                <TableCell>
                  {getTableCell(row.isAction, row.id, idx, "second")}
                </TableCell>
              </TableRow>
            ))}
            {urlStore?.map((row, idx) => (
              <TableRow key={idx}>
                <TableHead>{idx + 1}</TableHead>
                <TableCell>
                  {getTableUrl(row.id, row.url, row.isAction)}
                </TableCell>
                <TableCell>{row.created_at}</TableCell>
                <TableCell>{row.updated_at}</TableCell>
                <TableCell>
                  {getTableCell(row.isAction, row.id, idx, "first", row.url)}
                </TableCell>
                <TableCell>
                  {getTableCell(row.isAction, row.id, idx, "second", row.url)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UrlsTable;
