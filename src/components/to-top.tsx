"use client";

import { MdArrowDropUp } from "react-icons/md";
import { Button } from "./ui/button";
import { useEffect, useState, useRef } from "react";

export default function ToTop() {

  const [isScrolled, setIsScrolled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed bottom-4 right-4">
      <div className="flex items-center justify-center flex-col">
        {
          isScrolled && (
            <Button className="w-10 h-10 rounded-full p-1 cursor-pointer" asChild onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <MdArrowDropUp size={36} />
            </Button>
          )
        }
      </div>
    </div>
  )
}