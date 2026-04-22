"use client";

import { useEffect, useRef } from "react";

export const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observedElements = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const observeAnimatedElements = () => {
      const elements = ref.current?.querySelectorAll(".animate-on-scroll") ?? [];

      elements.forEach((element) => {
        if (observedElements.has(element)) {
          return;
        }

        observedElements.add(element);
        observer.observe(element);
      });
    };

    observeAnimatedElements();

    const mutationObserver = new MutationObserver(() => {
      observeAnimatedElements();
    });

    if (ref.current) {
      mutationObserver.observe(ref.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return ref;
};
