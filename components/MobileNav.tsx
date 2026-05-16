"use client"

import { Dialog, Transition } from "@headlessui/react"
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock"
import { Fragment, useState, useEffect, useRef } from "react"
import headerNavLinks from "@/data/headerNavLinks"
import { Menu, X, Zap } from "lucide-react"
import LanguageSelect from "./LanguageSelect"
import LinkNext from "next/link"
import { useTranslations } from "next-intl"

const MobileNav = () => {
  const t = useTranslations("HomePage")
  const [navShow, setNavShow] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  const closeNav = () => {
    setNavShow(false)
    enableBodyScroll(navRef.current)
  }

  const onToggleNav = () => {
    setNavShow((status) => {
      if (status) {
        enableBodyScroll(navRef.current)
      } else {
        disableBodyScroll(navRef.current)
      }
      return !status
    })
  }

  useEffect(() => {
    return clearAllBodyScrollLocks
  }, [])

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={navShow}
        onClick={onToggleNav}
        className="inline-flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-800/50 hover:text-white lg:hidden"
      >
        <Menu className="h-6 w-6" aria-hidden />
      </button>

      <Transition appear show={navShow} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={closeNav}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60" aria-hidden />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-250 transform"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in duration-200 transform"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed inset-y-0 right-0 flex w-full max-w-[min(100vw,20rem)] flex-col border-l border-slate-800/50 bg-slate-950 shadow-2xl">
              <div className="flex min-h-14 items-center justify-between border-b border-slate-800/50 px-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary-400" aria-hidden />
                  <Dialog.Title className="text-base font-bold text-white">Menu</Dialog.Title>
                </div>
                <button
                  type="button"
                  onClick={closeNav}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>

              <nav ref={navRef} className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-1">
                  {headerNavLinks.map((link) => (
                    <li key={link.title}>
                      <LinkNext
                        href={link.href}
                        onClick={closeNav}
                        className="flex min-h-12 items-center rounded-xl px-4 text-base font-medium text-slate-300 transition hover:bg-slate-800/50 hover:text-white"
                      >
                        {t(link.title)}
                      </LinkNext>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 border-t border-slate-800/50 pt-4">
                  <LanguageSelect />
                </div>
              </nav>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileNav
