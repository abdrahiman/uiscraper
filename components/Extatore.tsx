import React, { useRef, useEffect, MouseEvent, useState } from "react";
import { IoMdTrash, IoMdAdd, IoIosArrowDropdownCircle } from "react-icons/io";
import { HiCheck } from "react-icons/hi";
import { createRoot } from "react-dom/client";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Extatore() {
  const Element = useRef<any>(null);
  let Children = useRef<any>(null);

  let handleAddChild = () => {
    if (!Element.current.parentNode?.classList.contains("group")) {
      let parent = document.createElement("div");
      parent.className = "group";
      Element.current?.parentNode.append(parent);
      parent.append(Element.current);
      let childrenContainer = document.createElement("div");
      childrenContainer.className = "children";
      parent.append(childrenContainer);
      Children.current = childrenContainer;
    }
    // create a new child inside this group
    let childrenContainer = Children.current;
    let child = document.createElement("div");
    child.className = "child";
    createRoot(child).render(<Extatore />);
    childrenContainer.append(child);
  };
  let handleRemoveChild = () => {
    let parent = Element.current.parentNode;
    if (parent.className != "template") {
      if (parent.classList.contains("group")) {
        parent.parentNode.remove();
      }
      if (parent.parentNode.className == "children") {
        if (parent.parentNode.children.length == 1) {
          let oldChildrenContainer = parent;
          oldChildrenContainer.parentNode.append(Element.current);
          oldChildrenContainer.remove();
          let extractor = Element.current.parentNode.parentNode.firstChild;
          extractor.parentNode.parentNode.append(extractor);
          Element.current.parentNode.parentNode.remove();
        } else {
          parent.remove();
        }
      } else {
        parent.remove();
      }
    } else {
      Element.current.remove();
    }
    Children.current = Element.current.parentNode.querySelector(".children");
  };
  let [isArr, setIsArr] = useState(false);
  let handleHide = (e: MouseEvent) => {
    let tg = e.target as HTMLElement;
    let element: any = tg.parentNode;

    if (!element.parentNode?.classList.contains("hideChildren")) {
      element.parentNode?.classList.add("hideChildren");
    } else {
      element.parentNode?.classList.remove("hideChildren");
    }
  };

  return (
    <div
      ref={Element}
      className="extractor gap-4 p-2 rounded-lg flex justify-between items-center"
    >
      <button
        className={`p-2 hide bg-gray-100 rounded-lg ${
          Children.current != null ? "" : "opacity-40 pointer-event-none"
        }`}
        onClick={handleHide}
      >
        <IoIosArrowDropdownCircle />
      </button>
      <div className="flex gap-1 flex-col">
        <label htmlFor="">Name</label>
        <input type="text" className="name" placeholder="e.g heading" />
      </div>
      <div className="flex gap-1 flex-col">
        <label htmlFor="">Selector</label>
        <input type="text" className="selc" placeholder=".className > #id" />
      </div>
      <div
        className={`flex gap-1 flex-col ${
          isArr ? "opacity-25 pointer-events-none" : ""
        }`}
      >
        <label htmlFor="">Attribute</label>
        <input type="text" className="attr" placeholder="href" />
      </div>
      <div className="flex gap-1 flex-row">
        <span className="checkbox">
          <input
            type="checkbox"
            className="isarray"
            checked={isArr}
            onChange={() => setIsArr(!isArr)}
          />
          <span
            aria-hidden="true"
            className={isArr ? "bg checked" : "bg"}
            onClick={() => setIsArr(!isArr)}
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
          onClick={handleRemoveChild}
          className="bg-white p-1 rounded-lg hover:bg-red-400"
        >
          <IoMdTrash />
        </button>
      </div>
    </div>
  );
}
