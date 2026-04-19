import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import {
  Phone, Mail, MapPin, Menu, X, ChevronLeft, ChevronRight,
  Star, Award, Users, BookOpen, Clock, CheckCircle, GraduationCap,
  Microscope, Library, FileText, MessageCircle, CalendarDays,
  Monitor, Video, UserCheck, BookMarked, Trophy, Briefcase,
  ArrowRight, ExternalLink, Facebook, Instagram, Youtube, Twitter,
  ShieldCheck, UserCircle,
}  from 'lucide-react';

import adminphoto from '../assets/adminphoto.jpeg';
import logo from '../assets/Logo.jpeg';
import photo1 from '../assets/photo1.jpeg';
import photo2 from '../assets/photo2.jpeg';
import photo3 from '../assets/photo3.jpeg';
import photo4 from '../assets/photo4.jpeg';
import photo5 from '../assets/photo5.jpeg';
import photo6 from '../assets/photo6.webp';
import profile1 from '../assets/profile1.jpeg';
import profile2 from '../assets/profile2.jpeg';
import profile3 from '../assets/profile3.jpeg';
import profile4 from '../assets/profile4.jpeg';

/* ─── DATA ──────────────────────────────────────────────────── */
const NAV_LINKS = ['Home','About','Results','Alumni','Testimonials','Contact','Portal'];

const TOPPERS_CBSE = [
  { name: 'Patel Jiya S.',   pr: '94.8%' },
  { name: 'Patel Rutvi',     pr: '85%'   },
  { name: 'Patel Bhavya',    pr: '82.8%' },
  { name: 'Trivedi Dhyana',  pr: '82.6%' },
];

const STATS = [
  { label: 'Years of Excellence', value: 11,  suffix: '+', icon: Clock },
  { label: 'Students Taught',     value: 500, suffix: '+', icon: Users },
  { label: 'Expert Teachers',     value: 3,   suffix: '+', icon: GraduationCap },
  { label: 'Success Rate',        value: 95,  suffix: '%', icon: Trophy },
];

const FACILITIES = [
  { icon: Monitor,      text: 'Smart Classrooms with Projectors' },
  { icon: Microscope,   text: 'Well-equipped Science Lab' },
  { icon: FileText,     text: 'Weekly Test Series' },
  { icon: MessageCircle,text: 'Doubt Clearing Sessions' },
  { icon: CalendarDays, text: 'Parent-Teacher Meetings (Monthly)' },
  { icon: Users,        text: 'Small Batch Size (Max 20 Students)' },
  { icon: BookOpen,     text: 'Study Material Provided' },
  { icon: Monitor,      text: 'Online Test Portal' },
  { icon: UserCheck,    text: 'Individual Student Attention' },
  { icon: BookMarked,   text: 'Chapter-wise Practice Papers' },
  { icon: FileText,     text: 'Previous Year Paper Solutions' },
  { icon: Clock,        text: 'Weekend Crash Courses' },
  { icon: Briefcase,    text: 'Career Counseling Sessions' },
  { icon: CheckCircle,  text: 'Progress Reports to Parents' },
];

const TESTIMONIALS = [
  { name:'Patel Hiralben S.',    type:'Parent',  student:'Patel Dhruv S. (10th Sci)', batch:'2024-25', date:'March 2025',    msg:'My son\'s math scores improved from 65% to 89% in just 6 months. Nikunj Sir\'s teaching style is excellent! Regular tests and feedback helped him stay on track.' },
  { name:'Shah Neetaben R.',     type:'Parent',  student:'Shah Krisha R. (12th Sci)',  batch:'2023-24', date:'February 2025', msg:'Best decision we made. The regular tests and doubt-clearing sessions helped my daughter crack NEET. The faculty is very supportive and approachable.' },
  { name:'Desai Bipinkumar M.',  type:'Parent',  student:'Desai Kavya M. (10th)',      batch:'2024-25', date:'January 2025',  msg:'The personalized attention each student gets is amazing. Kavya went from average to class topper. Thank you Nikunj Sir for your dedication.' },
  { name:'Prajapati Dhruv D.',   type:'Student', student:'Self',                       batch:'2023-24', date:'May 2024',      msg:'I couldn\'t have scored 92.72% without Nikunj Sir\'s guidance. The test series was game-changing! The study material and practice papers are excellent.' },
  { name:'Trivedi Kavya T.',     type:'Student', student:'Self',                       batch:'2023-24', date:'April 2024',    msg:'The faculty is so supportive. They made difficult science concepts so easy to understand. The doubt-clearing sessions really helped me.' },
  { name:'Solanki Ashwinbhai P.',type:'Parent',  student:'Solanki Yash P.',            batch:'2024-25', date:'March 2025',    msg:'Very professional setup. Regular parent-teacher meetings keep us updated about progress. My son\'s confidence has improved dramatically.' },
];

const GALLERY_PHOTOS = [
  { src: photo1, caption: 'Classroom Session' },
  { src: photo2, caption: 'Learning Together' },
  { src: photo3, caption: 'Achievement Ceremony' },
  { src: photo4, caption: 'Student Activities' },
  { src: photo5, caption: 'Life at Eklavya' },
  { src: photo6, caption: 'Our Campus' },
];

const ALUMNI = [
  { name: 'Patel Jiya S.',   batch: '2026', achievement: 'CBSE X Top Achiever – 94.8%',  grade: '94.8% (10th CBSE)',  color: 'from-amber-500 to-orange-600',   profile: profile1 },
  { name: 'Patel Rutvi',     batch: '2026', achievement: 'CBSE X Top Achiever – 85%',    grade: '85% (10th CBSE)',    color: 'from-indigo-500 to-purple-600', profile: profile2 },
  { name: 'Patel Bhavya',    batch: '2026', achievement: 'CBSE X Top Achiever – 82.8%',  grade: '82.8% (10th CBSE)',  color: 'from-violet-500 to-indigo-600', profile: profile3 },
  { name: 'Trivedi Dhyana',  batch: '2026', achievement: 'CBSE X Top Achiever – 82.6%',  grade: '82.6% (10th CBSE)',  color: 'from-emerald-500 to-teal-600',  profile: profile4 },
];
function FadeIn({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.12 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ tag, title, subtitle }) {
  return (
    <FadeIn className="text-center mb-12">
      <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-widest mb-3">{tag}</span>
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-poppins mb-3">{title}</h2>
      {subtitle && <p className="text-gray-500 max-w-xl mx-auto text-base">{subtitle}</p>}
    </FadeIn>
  );
}

/* ─── NAVBAR ─────────────────────────────────────────────────── */
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="cursor-pointer" onClick={() => scrollTo('home')}>
            <img src={logo} alt="Eklavya Education" className="h-12 w-auto object-contain" />
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <button
                key={l}
                onClick={() => scrollTo(l.toLowerCase())}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                {l}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-2">
            <a href="tel:9574029090" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
              <Phone size={14} /> 9574029090
            </a>
            <Link to="/login" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-indigo-200 hover:shadow-lg">
              Portal Login
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(p => !p)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map(l => (
                <button key={l} onClick={() => scrollTo(l.toLowerCase())}
                  className="block w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                  {l}
                </button>
              ))}
              <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                <a href="tel:9574029090" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Phone size={14} /> 9574029090
                </a>
                <Link to="/login" onClick={() => setOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold text-center hover:bg-indigo-700 transition-all">
                  Portal Login
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ─── HERO ───────────────────────────────────────────────────── */
function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900">
      {/* Background blobs */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500 rounded-full blur-3xl opacity-20" />
      </div>
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-28">
        <div className="grid lg:grid-cols-2 gap-10 items-stretch">

          {/* ── LEFT ── */}
          <div className="flex flex-col justify-center">

            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-sm font-semibold mb-5 self-start">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              ADMISSION OPEN FOR 2026-27
            </motion.div>

            {/* Heading */}
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-poppins leading-tight mb-3">
              Eklavya
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Education</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-indigo-200 text-lg font-medium mb-1">
              STD : 1 TO 10 &nbsp;|&nbsp; STD : 11-12 SCI
            </motion.p>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="text-indigo-300 text-sm mb-6 max-w-md">
              Empowering students with quality education, regular assessments, and personalized guidance by{' '}
              <span className="text-white font-semibold">Nikunj Sir</span> since 2015.
            </motion.p>

            {/* CTA buttons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-3 mb-8">
              <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-2.5 rounded-xl bg-amber-400 text-gray-900 font-bold text-sm hover:bg-amber-300 transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2">
                Enroll Now <ArrowRight size={15} />
              </button>
              <a href="tel:9574029090"
                className="px-6 py-2.5 rounded-xl border-2 border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                <Phone size={15} /> Call Now
              </a>
              <Link to="/login"
                className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all flex items-center gap-2">
                Portal Login <ArrowRight size={15} />
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-6 mb-8">
              {[['500+','Students'],['95%','Success Rate'],['3+','Teachers']].map(([v, l]) => (
                <div key={l}>
                  <p className="text-2xl font-bold text-amber-400">{v}</p>
                  <p className="text-xs text-indigo-300">{l}</p>
                </div>
              ))}
            </motion.div>

            {/* Toppers card — left side, below stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl max-w-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <Trophy size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Congratulations!</p>
                  <p className="text-indigo-300 text-xs">Top Achievers CBSE-X 2026</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {TOPPERS_CBSE.map((t, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'}</span>
                      <span className="text-white text-xs font-medium">{t.name}</span>
                    </div>
                    <span className="text-amber-300 font-bold text-xs">{t.pr}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT — full photo ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-stretch"
          >
            <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 min-h-[480px] sm:min-h-[560px]">
              <img
                src={adminphoto}
                alt="Nikunj Parekh Sir — Eklavya Education"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              {/* Bottom gradient + name */}
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/75 via-indigo-950/10 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-white font-bold text-xl font-poppins drop-shadow">Nikunj Parekh Sir</p>
                <p className="text-indigo-300 text-sm">Founder & Head Educator</p>
              </div>
              {/* Floating badges */}
              <motion.div animate={{ y: [0, -7, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="absolute top-4 right-4 bg-amber-400 text-gray-900 rounded-2xl px-3 py-1.5 shadow-lg text-xs font-bold z-10">
                🎓 Batch 2026-27 Open
              </motion.div>
              <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
                className="absolute bottom-20 left-4 bg-indigo-600 text-white rounded-2xl px-3 py-1.5 shadow-lg text-xs font-bold z-10">
                📍 Kadi, Gujarat
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs flex flex-col items-center gap-1">
        <span>Scroll</span>
        <div className="w-px h-8 bg-white/20" />
      </motion.div>
    </section>
  );
}

/* ─── ACHIEVEMENTS ───────────────────────────────────────────── */
function Achievements() {
  return (
    <section id="results" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle tag="Our Results" title="🏆 Congratulations to Our Toppers" subtitle="Proud of every student who achieved excellence under Nikunj Sir's guidance." />

        <div className="grid lg:grid-cols-2 gap-8">
          {/* CBSE Table */}
          <FadeIn>
            <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h3 className="text-white font-bold text-lg font-poppins">Top Achievers CBSE-X</h3>
                <p className="text-indigo-200 text-sm">Board Examination 2026</p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-indigo-50">
                  <tr>
                    {['Rank','Student Name','%'].map(h => (
                      <th key={h} className="text-left py-3 px-5 text-indigo-700 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TOPPERS_CBSE.map((t, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="border-b border-gray-50 hover:bg-indigo-50/50 transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        {i === 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold text-xs">🥇 1st</span>}
                        {i === 1 && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold text-xs">🥈 2nd</span>}
                        {i === 2 && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold text-xs">🥉 3rd</span>}
                        {i === 3 && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">🏅 4th</span>}
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-gray-800">{t.name}</td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-indigo-600">{t.pr}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>

          {/* Right — profiles grid + admission banner */}
          <FadeIn delay={0.15}>
            <div className="space-y-5">
              {/* 4 profile photos */}
              <div className="grid grid-cols-4 gap-3">
                {TOPPERS_CBSE.map((t, i) => {
                  const profiles = [profile1, profile2, profile3, profile4];
                  const medals = ['🥇','🥈','🥉','🏅'];
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-indigo-200 shadow-md">
                        <img src={profiles[i]} alt={t.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-lg">{medals[i]}</span>
                      <p className="text-xs font-semibold text-gray-800 text-center leading-tight">{t.name}</p>
                      <p className="text-xs font-bold text-indigo-600">{t.pr}</p>
                    </div>
                  );
                })}
              </div>

              {/* Admission banner */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-3xl bg-gradient-to-r from-amber-400 to-orange-500 p-6 shadow-xl cursor-pointer"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <p className="text-white/80 text-sm font-medium mb-1">Limited Seats Available</p>
                <p className="text-white font-bold text-2xl font-poppins">Admission Open 2026-27</p>
                <p className="text-white/80 text-sm mt-1">STD 1–10 &nbsp;|&nbsp; STD 11-12 Science</p>
                <div className="mt-4 flex items-center gap-2 text-white font-semibold text-sm">
                  Enroll Now <ArrowRight size={16} />
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── ABOUT ──────────────────────────────────────────────────── */
function About() {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle tag="About Us" title="Who We Are" subtitle="Building futures through quality education since 2015." />

        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          {/* About text */}
          <FadeIn>
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <GraduationCap size={20} className="text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg font-poppins">Our Story</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Eklavya Education was established in 2015 by <span className="font-semibold text-indigo-600">Nikunj Parekh</span> with a vision to transform how students learn. We specialize in preparing students for Std 1 to 10 and Std 11-12 Science. Our unique teaching methodology combines conceptual clarity with regular testing, ensuring every student reaches their full potential. We believe in the philosophy of 'Eklavya' — self-learning with dedication and guidance.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin size={15} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold text-gray-800">Branch 1:</span> F-14, Vatsalya Status, Nr. Railway Station, Kadi</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin size={15} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold text-gray-800">Branch 2:</span> FF-19, Parmanand Landmark, Nr. Minda Flat, Karan Nagar Road, Kadi</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center mb-3">
                    <Star size={18} className="text-indigo-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Our Vision</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">To empower every student with quality education and help them achieve their highest potential in academics and life.</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
                    <Trophy size={18} className="text-amber-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Our Mission</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">To provide personalized coaching, regular assessments, and a supportive learning environment that builds confidence and excellence.</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Facilities */}
          <FadeIn delay={0.15}>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg font-poppins mb-6">Our Facilities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FACILITIES.map(({ icon: Icon, text }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-indigo-50 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
                      <Icon size={13} className="text-indigo-600" />
                    </div>
                    <span className="text-gray-700 text-xs font-medium">{text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── STATS ──────────────────────────────────────────────────── */
function Stats() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
  return (
    <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-700">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(({ label, value, suffix, icon: Icon }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                <Icon size={22} className="text-white" />
              </div>
              <p className="text-4xl font-bold text-white font-poppins">
                {inView ? <CountUp end={value} duration={2} suffix={suffix} /> : `0${suffix}`}
              </p>
              <p className="text-indigo-200 text-sm mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── ALUMNI ─────────────────────────────────────────────────── */
function Alumni() {
  return (
    <section id="alumni" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle tag="Our Alumni" title="Success Stories" subtitle="Our students are making us proud across India's top institutions." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ALUMNI.map((a, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <motion.div
                whileHover={{ scale: 1.03, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
                className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-white group"
              >
                {/* Gradient header with real photo */}
                <div className={`bg-gradient-to-r ${a.color} p-6 relative overflow-hidden flex flex-col items-center`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/40 shadow-lg mb-3 relative z-10">
                    <img src={a.profile} alt={a.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-white font-bold text-base font-poppins leading-tight text-center relative z-10">{a.name}</p>
                  <p className="text-white/70 text-xs relative z-10">Batch {a.batch}</p>
                </div>
                {/* Body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-2">
                    <Trophy size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 text-sm font-medium">{a.achievement}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-500 text-sm">{a.grade}</p>
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── TESTIMONIALS ───────────────────────────────────────────── */
function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const t = setInterval(() => {
      setDirection(1);
      setCurrent(p => (p + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const go = (dir) => {
    setDirection(dir);
    setCurrent(p => (p + dir + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const t = TESTIMONIALS[current];

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle tag="Testimonials" title="What Parents & Students Say" subtitle="Real feedback from our Eklavya family." />

        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-gray-700 text-base leading-relaxed mb-6 italic">"{t.msg}"</p>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">
                      {t.type} {t.student !== 'Self' ? `· ${t.student}` : ''} · {t.batch}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{t.date}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={() => go(-1)} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm">
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                  className={`rounded-full transition-all ${i === current ? 'w-6 h-2.5 bg-indigo-600' : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'}`} />
              ))}
            </div>
            <button onClick={() => go(1)} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm">
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* All testimonials grid (desktop) */}
        <div className="hidden lg:grid grid-cols-3 gap-5 mt-12">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={i} delay={i * 0.07}>
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
                className={`bg-white rounded-2xl p-5 border-2 transition-all cursor-pointer ${i === current ? 'border-indigo-300 shadow-md' : 'border-gray-100'}`}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={12} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-gray-600 text-xs leading-relaxed line-clamp-3 mb-3">"{t.msg}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-xs">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.type} · {t.batch}</p>
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── GALLERY ────────────────────────────────────────────────── */
function Gallery() {
  const [active, setActive] = useState(null);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle tag="Gallery" title="Life at Eklavya" subtitle="A glimpse into our vibrant learning environment." />

        {/* 6-photo grid — 3 cols, all equal */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {GALLERY_PHOTOS.map((p, i) => (
            <FadeIn key={i} delay={i * 0.07}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => setActive(p)}
                className="relative overflow-hidden rounded-2xl cursor-pointer shadow-md group aspect-video"
              >
                <img
                  src={p.src}
                  alt={p.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            </FadeIn>
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActive(null)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="relative max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl"
              >
                <img src={active.src} alt={active.caption} className="w-full object-contain max-h-[80vh]" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-3">
                  <p className="text-white text-sm font-medium">{active.caption}</p>
                </div>
                <button
                  onClick={() => setActive(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ─── CONTACT ────────────────────────────────────────────────── */
function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', grade: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: '', phone: '', grade: '', message: '' });
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle tag="Contact Us" title="Get In Touch" subtitle="We'd love to hear from you. Reach out for admissions or any queries." />

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Info */}
          <FadeIn>
            <div className="space-y-5">
              {[
                { icon: Phone,  label: 'Phone',   value: '9574029090 / 9876543210', href: 'tel:9574029090', color: 'bg-indigo-100 text-indigo-600' },
                { icon: Mail,   label: 'Email',   value: 'eklavyaeducation28@gmail.com', href: 'mailto:eklavyaeducation28@gmail.com', color: 'bg-amber-100 text-amber-600' },
                { icon: MapPin, label: 'Address', value: 'First Floor, Parmanand Landmark, FF-19, Near Minda Flat, Kadi, Gujarat 384440', href: 'https://www.google.com/search?q=eklavya+education+kadi', color: 'bg-emerald-100 text-emerald-600' },
              ].map(({ icon: Icon, label, value, href, color }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer">
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-indigo-200 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                      <p className="text-gray-800 font-semibold text-sm">{value}</p>
                    </div>
                  </motion.div>
                </a>
              ))}

              {/* Map embed */}
              <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-52 bg-gradient-to-br from-indigo-100 to-purple-100 flex flex-col items-center justify-center gap-3">
                <MapPin size={32} className="text-indigo-400" />
                <p className="text-gray-600 text-sm font-medium">Kadi, Gujarat 384440</p>
                <a
                  href="https://www.google.com/search?q=eklavya+education+kadi"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all"
                >
                  <ExternalLink size={14} /> View on Google Maps
                </a>
              </div>
            </div>
          </FadeIn>

          {/* Form */}
          <FadeIn delay={0.15}>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-xl font-poppins mb-6">Send Us a Message</h3>
              {sent ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-emerald-600" />
                  </div>
                  <p className="font-bold text-gray-900 text-lg">Message Sent!</p>
                  <p className="text-gray-500 text-sm mt-1">We'll get back to you within 24 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm transition-all"
                        placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input required type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm transition-all"
                        placeholder="9XXXXXXXXX" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student Grade</label>
                      <select value={form.grade} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm transition-all bg-white">
                        <option value="">Select grade</option>
                        {['Std 1','Std 2','Std 3','Std 4','Std 5','Std 6','Std 7','Std 8','Std 9','Std 10','Std 11 Sci','Std 12 Sci'].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm transition-all resize-none"
                        placeholder="Tell us about your requirements…" />
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-200 hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    Send Message <ArrowRight size={16} />
                  </motion.button>
                </form>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── PORTAL ACCESS ──────────────────────────────────────────── */
const PORTAL_ROLES = [
  {
    key: 'admin',
    label: 'Admin',
    desc: 'Manage users, batches, announcements & full system control',
    icon: ShieldCheck,
    gradient: 'from-violet-600 to-purple-700',
    shadow: 'hover:shadow-violet-200',
    features: ['User Management', 'Batch Control', 'System Settings', 'Reports'],
  },
  {
    key: 'teacher',
    label: 'Teacher',
    desc: 'Upload marks, manage tests, mark attendance & reply to queries',
    icon: BookOpen,
    gradient: 'from-blue-500 to-blue-700',
    shadow: 'hover:shadow-blue-200',
    features: ['Upload Marks', 'Mark Attendance', 'Post Homework', 'AI Insights'],
  },
  {
    key: 'parent',
    label: 'Parent',
    desc: "Track your child's marks, attendance, download report cards",
    icon: Users,
    gradient: 'from-emerald-500 to-green-700',
    shadow: 'hover:shadow-emerald-200',
    features: ['View Marks', 'Attendance', 'Report Card PDF', 'Ask Queries'],
  },
  {
    key: 'student',
    label: 'Student',
    desc: 'Check your scores, homework, attendance and performance trends',
    icon: UserCircle,
    gradient: 'from-amber-500 to-orange-600',
    shadow: 'hover:shadow-amber-200',
    features: ['My Marks', 'Attendance', 'Homework', 'Performance Charts'],
  },
];




function Footer() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-white/20">
                <img src={logo} alt="Eklavya Education" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-white font-poppins">Eklavya Education</p>
                <p className="text-xs text-indigo-400">Kadi, Gujarat</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4 max-w-xs">
              Empowering students from Std 1 to 12 Science with quality education, regular assessments, and personalized guidance since 2015.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-colors">
                  <Icon size={16} className="text-gray-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-white font-semibold mb-4 text-sm">Quick Links</p>
            <div className="space-y-2">
              {NAV_LINKS.slice(0, 6).map(l => (
                <button key={l} onClick={() => scrollTo(l.toLowerCase())}
                  className="block text-sm hover:text-indigo-400 transition-colors text-left">
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Portal logins */}
          <div>
            <p className="text-white font-semibold mb-4 text-sm">Portal Login</p>
            <div className="space-y-2">
              {['Admin','Teacher','Parent','Student'].map(role => (
                <Link key={role} to="/login"
                  className="flex items-center gap-1.5 text-sm hover:text-indigo-400 transition-colors">
                  <ArrowRight size={11} /> {role} Login
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-white font-semibold mb-4 text-sm">Contact</p>
            <div className="space-y-3 text-sm">
              <a href="tel:9574029090" className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
                <Phone size={13} /> 9574029090
              </a>
              <a href="mailto:eklavyaeducation28@gmail.com" className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
                <Mail size={13} /> eklavyaeducation28@gmail.com
              </a>
              <div className="flex items-start gap-2">
                <MapPin size={13} className="mt-0.5 flex-shrink-0" />
                <span>Branch 1: F-14, Vatsalya Status, Nr. Railway Station, Kadi<br />Branch 2: FF-19, Parmanand Landmark, Nr. Minda Flat, Karan Nagar Road, Kadi</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} Eklavya Education. All rights reserved.</p>
          <p>Established 2015 · Kadi, Gujarat · By Nikunj Parekh</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── MAIN EXPORT ────────────────────────────────────────────── */
export default function Landing() {
  useEffect(() => {
    document.title = 'Eklavya Education – Quality Coaching in Kadi, Gujarat';
  }, []);

  return (
    <div className="font-inter">
      <Navbar />
      <Hero />
      <Achievements />
      <About />
      <Stats />
      <Alumni />
      <Testimonials />
      <Gallery />
      <Contact />
      
      <Footer />
    </div>
  );
}
