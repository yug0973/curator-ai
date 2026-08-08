import React, { useState } from "react";
import { motion } from "framer-motion";
import { BlogPost } from "../types/index.js";
import { Clock, ArrowLeft, BookOpen } from "lucide-react";

// Curated blog posts
const BLOG_POSTS: BlogPost[] = [
  {
    id: "post_001",
    title: "The Gap Between Who You Are and Who You Want to Be",
    excerpt: "Understanding the identity gap is the first step toward meaningful transformation. Here's how to map yours.",
    content: `# The Gap Between Who You Are and Who You Want to Be

The most powerful question you can ask yourself isn't "What do I want to achieve?" but "Who do I want to become?"

## The Identity Gap

Your **identity gap** is the distance between your current self and your aspirational self. It's not about goals or achievements—it's about the person you're becoming through your daily actions.

### Three Components of Identity

1. **Aspirational Traits**: Who you want to be (disciplined, confident, curious)
2. **Current Behaviors**: What you actually do every day
3. **The Gap**: The work required to bridge the two

## Why Most People Stay Stuck

People focus on outcomes (lose 20 pounds, build a business) instead of identity (become someone who values health, become an entrepreneur). When you shift focus to identity, behavior change becomes natural.

## How to Close Your Gap

**Step 1: Define Your Aspirational Self**
Write down 3-5 traits that define who you want to become. Be specific.

**Step 2: Audit Your Current Behaviors**
What do you actually do every day? Does it align with your aspirational self?

**Step 3: Design Tiny Habit Changes**
Small, consistent actions compound into identity transformation.

**Step 4: Track and Reflect**
Use tools like Peak to visualize your progress and course-correct in real-time.

## The Power of Identity-First Thinking

When you think "I am a writer" instead of "I want to write a book," you act differently. Your identity becomes your compass, guiding every micro-decision throughout the day.

Start today. Who are you becoming?`,
    author: "Peak Team",
    publishedDate: "2026-07-15",
    tags: ["Identity", "Growth", "Mindset"],
    readTime: 5,
  },
  {
    id: "post_002",
    title: "Why Discipline Beats Motivation Every Time",
    excerpt: "Motivation is fleeting. Discipline is permanent. Learn how to build systems that don't rely on feeling inspired.",
    content: `# Why Discipline Beats Motivation Every Time

Motivation gets you started. Discipline keeps you going.

## The Motivation Trap

We've been sold a lie: that you need to "feel motivated" to take action. This creates a dependency on external triggers—inspirational videos, perfect conditions, the right mood.

**The truth?** High performers don't wait for motivation. They act regardless of how they feel.

## What is Discipline?

Discipline is the practice of doing what needs to be done, when it needs to be done, whether you feel like it or not. It's a skill, not a personality trait.

### The Discipline Formula

1. **Clear Identity**: Know who you are becoming
2. **Non-Negotiable Standards**: Define your minimum daily actions
3. **Environment Design**: Make good behaviors easy, bad behaviors hard
4. **Accountability Systems**: Track publicly or with a partner

## Building Your Discipline Muscle

**Week 1-2: Start Stupidly Small**
Commit to 5 minutes of your target behavior. The goal is consistency, not intensity.

**Week 3-4: Add Friction to Distractions**
Delete social media apps. Put your phone in another room. Make procrastination inconvenient.

**Week 5-6: Stack Habits**
After [existing habit], I will [new habit]. Leverage existing routines.

**Week 7-8: Reflect and Adjust**
What's working? What's not? Double down on what moves the needle.

## The Compound Effect

One year from now, you'll wish you had started today. Discipline isn't glamorous, but it's the only reliable path to becoming who you want to be.

Start with one non-negotiable. Make it so small you can't say no. Then never miss twice.`,
    author: "Peak Team",
    publishedDate: "2026-07-20",
    tags: ["Discipline", "Habits", "Systems"],
    readTime: 6,
  },
  {
    id: "post_003",
    title: "The Science of Building Unbreakable Habits",
    excerpt: "What neuroscience teaches us about behavior change, and how to apply it to your daily routine.",
    content: `# The Science of Building Unbreakable Habits

Your brain is a prediction machine. Understanding how it works is the key to effortless habit formation.

## How Habits Form in the Brain

Every habit follows a loop:
1. **Cue**: Trigger that initiates the behavior
2. **Craving**: Motivational force behind the habit
3. **Response**: The actual behavior
4. **Reward**: The benefit from the behavior

### The Dopamine Prediction Error

Your brain releases dopamine not when you get a reward, but when you *anticipate* it. This is why checking your phone is so addictive—the *possibility* of a notification is more compelling than the notification itself.

## Four Laws of Behavior Change

**Make it Obvious**
- Design your environment to surface cues for good habits
- Use implementation intentions: "When X happens, I will do Y"

**Make it Attractive**
- Bundle habits with things you enjoy (temptation bundling)
- Join a culture where your desired behavior is the norm

**Make it Easy**
- Reduce friction: prepare your gym clothes the night before
- Use the 2-minute rule: scale habits down to 2 minutes

**Make it Satisfying**
- Track your habits visually (don't break the chain)
- Celebrate small wins immediately

## Breaking Bad Habits

The inverse applies:
- Make it Invisible (remove cues)
- Make it Unattractive (reframe negative consequences)
- Make it Difficult (add friction)
- Make it Unsatisfying (accountability partner)

## The Identity-Based Approach

Most people focus on outcomes (I want to run a marathon). Winners focus on identity (I am a runner).

**Ask yourself:** What would someone with my aspirational identity do in this situation?

Then do that.

## Putting It Into Practice

1. Choose ONE habit that aligns with your aspirational identity
2. Make it so easy you can't say no (2-minute version)
3. Track it daily for 30 days
4. Never miss twice

Remember: You don't rise to your goals. You fall to your systems. Build better systems.`,
    author: "Peak Team",
    publishedDate: "2026-07-25",
    tags: ["Habits", "Neuroscience", "Systems"],
    readTime: 7,
  },
  {
    id: "post_004",
    title: "How to Learn Anything 10x Faster",
    excerpt: "Evidence-based strategies for accelerated skill acquisition that actually work.",
    content: `# How to Learn Anything 10x Faster

The difference between fast learners and slow learners isn't talent. It's strategy.

## The Feynman Technique

Named after physicist Richard Feynman, this is the most effective learning method:

1. **Choose a concept** you want to learn
2. **Teach it to a child** (use simple language, no jargon)
3. **Identify gaps** in your explanation
4. **Review and simplify** until you can explain it clearly

**Why it works:** Teaching forces you to organize knowledge and expose what you don't actually understand.

## Active Recall > Passive Review

Reading and highlighting feel productive, but they're inefficient. Your brain learns through retrieval, not recognition.

**Instead of re-reading:**
- Close the book and write down everything you remember
- Use flashcards (spaced repetition)
- Explain concepts out loud without notes

## The 80/20 of Skill Acquisition

For any skill, 20% of techniques produce 80% of results.

**Example: Guitar**
- Learn 4 basic chords → Play thousands of songs
- vs. Learning music theory → Years before playing anything

**How to find your 20%:**
1. Deconstruct the skill into sub-skills
2. Identify which sub-skills are used most often
3. Focus exclusively on those for the first 20 hours

## Deliberate Practice vs. Naive Practice

**Naive practice:** Repeating what you already know  
**Deliberate practice:** Working at the edge of your current ability

**Characteristics of deliberate practice:**
- Specific goals (improve X technique)
- Immediate feedback (coach, recording, metrics)
- Focus on weaknesses, not strengths
- Mental discomfort (you're stretching)

## The Interleaving Effect

Don't practice one thing until mastery, then move on. Mix different skills/topics within the same session.

**Why?** Your brain learns to distinguish between concepts and apply them flexibly.

## Spaced Repetition Schedule

- Review after 1 day
- Review after 3 days
- Review after 7 days
- Review after 21 days
- Review after 60 days

By the 5th review, it's permanent.

## Meta-Learning: Learn How to Learn

The fastest learners have learned how to learn. They optimize for:
1. **Speed**: How quickly can I acquire the basics?
2. **Depth**: How deeply do I need to understand?
3. **Transfer**: How will this help me learn related skills?

**Action step:** Before learning anything new, spend 10% of your time researching *how* experts learned it.

Start with one skill. Apply these principles for 20 hours. You'll be shocked at your progress.`,
    author: "Peak Team",
    publishedDate: "2026-07-28",
    tags: ["Learning", "Skill Acquisition", "Productivity"],
    readTime: 8,
  },
];

export const BlogPage: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(BLOG_POSTS.flatMap((p) => p.tags)));

  const filteredPosts = selectedTag
    ? BLOG_POSTS.filter((p) => p.tags.includes(selectedTag))
    : BLOG_POSTS;

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-white">
        <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(to right,#000 1px,transparent 1px),linear-gradient(to bottom,#000 1px,transparent 1px)", backgroundSize: "80px 80px" }} />

        <div className="relative max-w-3xl mx-auto px-8 py-16">
          <button
            onClick={() => setSelectedPost(null)}
            className="inline-flex items-center gap-2 text-[13px] text-neutral-500 hover:text-neutral-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to all posts
          </button>

          <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-[48px] font-bold tracking-[-0.03em] text-neutral-900 leading-[1.1] mb-4">
              {selectedPost.title}
            </h1>

            <div className="flex items-center gap-4 text-[13px] text-neutral-500 mb-8 pb-8 border-b border-neutral-200">
              <span>{selectedPost.author}</span>
              <span>•</span>
              <span>{new Date(selectedPost.publishedDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{selectedPost.readTime} min read</span>
              </div>
            </div>

            <div className="prose prose-neutral max-w-none">
              {selectedPost.content.split("\n").map((line, idx) => {
                if (line.startsWith("# ")) {
                  return <h1 key={idx} className="text-[36px] font-bold text-neutral-900 mt-12 mb-6">{line.slice(2)}</h1>;
                }
                if (line.startsWith("## ")) {
                  return <h2 key={idx} className="text-[28px] font-semibold text-neutral-900 mt-10 mb-4">{line.slice(3)}</h2>;
                }
                if (line.startsWith("### ")) {
                  return <h3 key={idx} className="text-[20px] font-semibold text-neutral-900 mt-8 mb-3">{line.slice(4)}</h3>;
                }
                if (line.startsWith("**") && line.endsWith("**")) {
                  return <p key={idx} className="text-[16px] font-semibold text-neutral-900 mt-4">{line.slice(2, -2)}</p>;
                }
                if (line.startsWith("- ")) {
                  return <li key={idx} className="text-[15px] text-neutral-700 leading-relaxed ml-6">{line.slice(2)}</li>;
                }
                if (line.trim() === "") {
                  return <div key={idx} className="h-2" />;
                }
                return <p key={idx} className="text-[15px] text-neutral-700 leading-relaxed my-4">{line}</p>;
              })}
            </div>

            <div className="mt-12 pt-8 border-t border-neutral-200">
              <p className="text-[13px] text-neutral-400 uppercase tracking-wider mb-3">Tags</p>
              <div className="flex flex-wrap gap-2">
                {selectedPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full border border-neutral-200 text-[12px] text-neutral-600 bg-neutral-50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(to right,#000 1px,transparent 1px),linear-gradient(to bottom,#000 1px,transparent 1px)", backgroundSize: "80px 80px" }} />

      <div className="relative max-w-6xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 h-6 rounded-full border border-neutral-200 bg-neutral-50 text-[11px] font-medium text-neutral-500 tracking-wide uppercase mb-6">
            <BookOpen className="w-3 h-3" />
            Curated Content
          </div>
          <h1 className="text-[40px] font-semibold tracking-[-0.03em] text-neutral-900 mb-3">
            Growth Library
          </h1>
          <p className="text-[15px] text-neutral-500 max-w-xl">
            Evidence-based articles on identity, discipline, learning, and sustainable behavior change.
          </p>
        </div>

        {/* Tag Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              selectedTag === null
                ? "bg-neutral-900 text-white"
                : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:border-neutral-400"
            }`}
          >
            All Posts
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                selectedTag === tag
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:border-neutral-400"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedPost(post)}
              className="border border-neutral-200 rounded-xl p-6 bg-white hover:border-neutral-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-[12px] text-neutral-400 mb-4">
                <span>{new Date(post.publishedDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  <span>{post.readTime} min</span>
                </div>
              </div>

              <h2 className="text-[20px] font-semibold text-neutral-900 mb-3 group-hover:text-neutral-600 transition-colors">
                {post.title}
              </h2>
              <p className="text-[14px] text-neutral-500 leading-relaxed mb-4">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full border border-neutral-200 text-[11px] text-neutral-500 bg-neutral-50"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <span className="text-[13px] text-neutral-900 font-medium group-hover:underline">
                  Read article →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
