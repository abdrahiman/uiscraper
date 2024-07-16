import React, { useRef, useEffect, MouseEvent, useState } from "react";
import { IoMdTrash, IoMdAdd, IoIosArrowDropdownCircle } from "react-icons/io";

import { HiCheck } from "react-icons/hi";

export interface ISelector {
  name: string;
  selector: string;
  attr: string;
  children: ISelector[] | never;
  isArray: boolean;
  id: number;
}

export default function Selector({
  selectors,
  setSelectors,
  data,
}: {
  data: ISelector;
  selectors: ISelector[];
  setSelectors: any;
}) {
  let handleAddChild = () => {
    data.children.push({
      name: "",
      attr: "",
      selector: "",
      isArray: false,
      children: [],
      id: Date.now(),
    });
    setSelectors([...selectors]);
  };

  let findSelectorAndDelete = (children: ISelector[]) => {
    for (let i = 0; i < children.length; i++) {
      if (children[i].id == data.id) {
        children.splice(i, 1);
        setSelectors([...selectors]);
        return;
      }
      if (children[i].children.length != 0)
        findSelectorAndDelete(children[i].children);
    }
  };

  let hideChildren = (e: MouseEvent) => {
    let tg = e.target as HTMLElement;
    let element: any = tg.parentNode;

    if (!element.parentNode?.classList.contains("hideChildren")) {
      element.parentNode?.classList.add("hideChildren");
    } else {
      element.parentNode?.classList.remove("hideChildren");
    }
  };

  return (
    <div className="group">
      <div
        className={`selector text-sm gap-4 p-2 rounded-lg ${
          data.children.length != 0 ? "rounded-es-none" : ""
        } flex justify-between items-center`}
      >
        <button
          className={`p-2 hide bg-white rounded-lg 
        ${data.children.length != 0 ? "" : "opacity-40 pointer-event-none"}
        `}
          onClick={hideChildren}
        >
          <IoIosArrowDropdownCircle />
        </button>
        <div className="flex gap-1 flex-col">
          <label htmlFor="">Name</label>
          <input
            type="text"
            className="name text-sm"
            placeholder="e.g heading"
            value={data.name}
            onChange={(e) => {
              data.name = e.target.value;
              setSelectors([...selectors]);
            }}
          />
        </div>
        <div className="flex gap-1 flex-col">
          <label htmlFor="">Selector</label>
          <input
            type="text"
            className="selc"
            placeholder=".className > #id"
            value={data.selector}
            onChange={(e) => {
              data.selector = e.target.value;
              setSelectors([...selectors]);
            }}
          />
        </div>
        <div
          className={`flex gap-1 flex-col ${
            data.children.length != 0 ? "opacity-25 pointer-events-none" : ""
          }`}
        >
          <label htmlFor="">Attribute</label>
          <input
            type="text"
            className="attr"
            placeholder="href"
            value={data.attr}
            onChange={(e) => {
              data.attr = e.target.value;
              setSelectors([...selectors]);
            }}
          />
        </div>
        <div className="flex gap-1 flex-row">
          <span className="checkbox">
            <input type="checkbox" className="isarray" checked={data.isArray} />
            <span
              aria-hidden="true"
              className={data.isArray ? "bg checked" : "bg"}
              onClick={() => {
                data.isArray = !data.isArray;
                setSelectors([...selectors]);
              }}
            >
              <HiCheck size={14} />
            </span>
          </span>
          <label htmlFor="" className="min-w-full">
            Array
          </label>
        </div>
        <div className="actions flex gap-4 ml-2 items-center ">
          <button onClick={handleAddChild} className="bg-white p-1 rounded-lg">
            <IoMdAdd />
          </button>
          <button
            onClick={() => findSelectorAndDelete(selectors)}
            className="bg-white p-1 rounded-lg hover:bg-red-500"
          >
            <IoMdTrash />
          </button>
        </div>
      </div>
      {data.children.length != 0 && (
        <div className="children">
          {data.children.map((child) => (
            <div className="child" key={child.id}>
              <Selector
                selectors={selectors}
                setSelectors={setSelectors}
                data={child}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
