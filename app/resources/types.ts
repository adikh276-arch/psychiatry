import React from 'react';

export type ResourceType = 'tips' | 'articles' | 'stories' | 'myths';

export interface BaseResource {
  id: string;
  title: string;
  preview: string;
  concern: string;
  type: ResourceType;
}

export interface Tip extends BaseResource {
  type: 'tips';
  icon?: React.ElementType;
  whyItHelps: string;
  whatYouCanDo: string[];
  gentleReminder?: string;
  example?: { instead: string; tryThis: string };
  actionLabel?: string;
}

export interface Article extends BaseResource {
  type: 'articles';
  tag: string;
  readTime: string;
  deck: string;
  body: string; // HTML or markdown
  takeaway: string;
}

export interface Story extends BaseResource {
  type: 'stories';
  name: string;
  age: number;
  identity: string;
  avatarUrl?: string;
  portraitUrl?: string;
  quote: string;
  story: string[];
  highlight: string;
  takeaway: string;
}

export interface Myth extends BaseResource {
  type: 'myths';
  myth: string;
  truth: string;
  explanation: string;
  takeaway: string;
}

export type Resource = Tip | Article | Story | Myth;
