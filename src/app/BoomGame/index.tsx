"use client";

import { useState, useEffect } from "react";
import { BlockState, type block, type pos } from "./interfaces";
import "./style.css";

const RATE = 0.2;
const DEBUG = true;

function Item({
  info,
  size,
  onClick,
  onContextMenu,
}: {
  info: block;
  size: number;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  const [shownMsg, setShownMsg] = useState("");

  useEffect(() => {
    if (info.state === BlockState.display) {
      if (info.boomFlag) {
        setShownMsg("💣");
      } else if (info.adjacence) {
        setShownMsg(String(info.adjacence));
      }
    } else if (info.state === BlockState.flag) {
      setShownMsg("🚩");
    }
  }, [info.boomFlag, info.adjacence, info.state]);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background:
          info.state !== BlockState.display ? "rgba(0,0,0,0.01)" : "white",
      }}
      className={[
        "block-item",
        info.state !== BlockState.display ? "hover:shadow-xl" : "",
        "transition-all",
      ].join(" ")}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {shownMsg}
    </div>
  );
}

export function BoomGame({
  width,
  height,
  size,
}: {
  width: number;
  height: number;
  size: number;
}) {
  const ADJ_BLOCK = [
    { x: -1, y: -1, value: -width - 1 },
    { x: 0, y: -1, value: -width },
    { x: 1, y: -1, value: -width + 1 },
    { x: -1, y: 0, value: -1 },
    { x: 1, y: 0, value: 1 },
    { x: -1, y: 1, value: width - 1 },
    { x: 0, y: 1, value: width },
    { x: 1, y: 1, value: width + 1 },
  ];

  // 是否第一点击
  const [isFirstClick, setFirstClick] = useState(false);

  // 初始化列表
  const [blockList, setBlockList] = useState(
    Array.from({ length: width * height }).map(
      (_, index): block => ({
        pos: {
          x: index % width,
          y: Math.floor(index / width),
        },
        boomFlag: false,
        adjacence: 0,
        state: BlockState.initial,
      })
    )
  );

  // 位置信息是否非法
  function validPos(pos: pos) {
    return pos.x < 0 || pos.x >= width || pos.y < 0 || pos.y >= height;
  }

  // 计算临近变量
  function getAdjacence(index: number, arr: Array<block>): number {
    let count = 0;
    ADJ_BLOCK.forEach((item) => {
      if (arr[index].boomFlag) {
        return;
      }
      const currentPos: pos = {
        x: arr[index].pos.x + item.x,
        y: arr[index].pos.y + item.y,
      };
      // 如果越界就pass
      if (validPos(currentPos)) {
        return;
      }
      const currenIndex = index + item.value;
      if (arr[currenIndex].boomFlag) {
        count++;
      }
    });
    return count;
  }

  function displayBlock(index: number, arr: Array<block>) {
    if (arr[index].state === BlockState.display) {
      // 如果是翻过的就不管
      return;
    }
    // 先翻点击的
    arr[index].state = BlockState.display;
    if (arr[index].boomFlag) {
      // 是炸弹就寄
      return;
    }
    ADJ_BLOCK.forEach((item) => {
      if (arr[index].boomFlag) {
        return;
      }
      const currentPos: pos = {
        x: arr[index].pos.x + item.x,
        y: arr[index].pos.y + item.y,
      };
      // 如果越界就pass
      if (validPos(currentPos)) {
        return;
      }
      const currenIndex = index + item.value;
      if (arr[currenIndex].boomFlag) {
        // 如果下一个合法的邻接块是炸弹就跳过
        return;
      } else {
        if (arr[index].adjacence === 0) {
          // 如果当前是0，见到不是炸弹的就翻
          displayBlock(currenIndex, arr);
        } else {
          // 如果不是0，必须翻0
          if (arr[currenIndex].adjacence === 0) {
            displayBlock(currenIndex, arr);
          }
        }
      }
    });
  }

  const list = blockList.map((item, index, arr) => {
    const clickHandle = () => {
      const arrCopy = [...arr];
      console.log(isFirstClick);
      if (!isFirstClick) {
        setFirstClick(true)
        // 第一次点击时计算炸弹在哪
        arrCopy.forEach((_item, _index) => {
          _item.boomFlag = Math.random() < RATE;
        });
        arrCopy[index].boomFlag = false;
        ADJ_BLOCK.forEach((adj_block) => {
          const currentPos: pos = {
            x: arrCopy[index].pos.x + adj_block.x,
            y: arrCopy[index].pos.y + adj_block.y,
          };
          // 如果越界就pass
          if (validPos(currentPos)) {
            return;
          }
          const currenIndex = index + adj_block.value;
          arrCopy[currenIndex].boomFlag = false;
        });
        arrCopy.forEach((_item, _index) => {
          _item.adjacence = getAdjacence(_index, arrCopy);
        });
      }
      displayBlock(index, arr);
      setBlockList(arrCopy);

      // 判断是否结束游戏
      if (
        arr.filter((item) => item.state === BlockState.display).length ===
        width * height - gameInfo.boomCount
      ) {
        alert("游戏胜利");
        window.location.reload();
      }
      if (arr[index].boomFlag) {
        alert("游戏失败");
        window.location.reload();
      }
    };

    const contextHandle = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      const arrCopy = [...arr];
      arrCopy[index].state = BlockState.flag;
      setBlockList(arrCopy);
    };

    return (
      <Item
        info={item}
        key={index}
        size={size}
        onClick={clickHandle}
        onContextMenu={contextHandle}
      />
    );
  });

  const [gameInfo, setGameInfo] = useState(() => ({
    boomCount: 0,
  }));

  useEffect(() => {
    const boomCount = blockList.filter((item) => item.boomFlag).length;
    setGameInfo((prevGameInfo) => ({
      ...prevGameInfo,
      boomCount,
    }));
  }, [blockList]);

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: `${size * width}px` }} className="flex flex-wrap">
        {list}
      </div>
      💣：{gameInfo.boomCount}
    </div>
  );
}
