'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Reply, Send, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Comment, CreateCommentRequest, CreateCommentResponse } from '@/types/blog';

interface CommentsSectionProps {
  postSlug: string;
  initialComments: Comment[];
  totalComments: number;
}

interface CommentItemProps {
  comment: Comment;
  postSlug: string;
  onReply: (parentId: string) => void;
  onNewComment: (comment: Comment) => void;
}

function CommentItem({ comment, postSlug, onReply, onNewComment }: CommentItemProps) {
  const commentDate = new Date(comment.createdAt);
  const authorName = comment.author?.name || comment.guestName || 'Anonymous';

  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0">
      <div className="flex gap-3">
        {/* Author Avatar */}
        <div className="flex-shrink-0">
          {comment.author?.image ? (
            <Image
              src={comment.author.image}
              alt={authorName}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-400" />
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{authorName}</span>
            {comment.guestWebsite && (
              <a
                href={comment.guestWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-700 text-sm"
              >
                {comment.guestWebsite.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="text-gray-500 text-sm flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {commentDate.toLocaleDateString()}
            </span>
          </div>

          <div className="text-gray-700 mb-2 whitespace-pre-wrap">
            {comment.content}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReply(comment.id)}
            className="text-teal-600 hover:text-teal-700 p-0 h-auto"
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </Button>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 pl-4 border-l border-gray-200 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postSlug={postSlug}
                  onReply={onReply}
                  onNewComment={onNewComment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentForm({ 
  postSlug, 
  parentId, 
  onSubmit, 
  onCancel 
}: {
  postSlug: string;
  parentId?: string;
  onSubmit: (comment: Comment) => void;
  onCancel?: () => void;
}) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    guestName: '',
    guestEmail: '',
    guestWebsite: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    if (!formData.content.trim()) {
      setErrors({ content: 'Comment content is required' });
      return;
    }

    if (!session && (!formData.guestName.trim() || !formData.guestEmail.trim())) {
      setErrors({
        ...(!formData.guestName.trim() ? { guestName: 'Name is required' } : {}),
        ...(!formData.guestEmail.trim() ? { guestEmail: 'Email is required' } : {}),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData: CreateCommentRequest = {
        content: formData.content.trim(),
        postId: '', // Will be resolved by API
        parentId,
        ...(session ? {} : {
          guestName: formData.guestName.trim(),
          guestEmail: formData.guestEmail.trim(),
          guestWebsite: formData.guestWebsite.trim() || undefined,
        }),
      };

      const response = await fetch(`/api/posts/${postSlug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result: CreateCommentResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit comment');
      }

      if (result.success && result.comment) {
        onSubmit(result.comment);
        setFormData({
          content: '',
          guestName: '',
          guestEmail: '',
          guestWebsite: '',
        });
        if (onCancel) onCancel();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to submit comment' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {parentId ? 'Reply to Comment' : 'Leave a Comment'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Guest Information Fields */}
          {!session && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guestName">Name *</Label>
                <Input
                  id="guestName"
                  type="text"
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  className={errors.guestName ? 'border-red-300' : ''}
                />
                {errors.guestName && (
                  <p className="text-red-600 text-sm mt-1">{errors.guestName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="guestEmail">Email *</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={formData.guestEmail}
                  onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                  className={errors.guestEmail ? 'border-red-300' : ''}
                />
                {errors.guestEmail && (
                  <p className="text-red-600 text-sm mt-1">{errors.guestEmail}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="guestWebsite">Website (Optional)</Label>
                <Input
                  id="guestWebsite"
                  type="url"
                  value={formData.guestWebsite}
                  onChange={(e) => setFormData({ ...formData, guestWebsite: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          )}

          {/* Comment Content */}
          <div>
            <Label htmlFor="content">Comment *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              placeholder="Share your thoughts..."
              className={errors.content ? 'border-red-300' : ''}
            />
            {errors.content && (
              <p className="text-red-600 text-sm mt-1">{errors.content}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Your comment will be reviewed before being published.
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Comment
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}

            {!session && (
              <div className="flex-1 text-right">
                <Link
                  href="/auth/login"
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  Sign in to comment
                </Link>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function CommentsSection({ postSlug, initialComments, totalComments }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [replyToComment, setReplyToComment] = useState<string | null>(null);

  const handleNewComment = (newComment: Comment) => {
    if (replyToComment) {
      // Handle reply - would need to update the parent comment's replies array
      // For simplicity, we'll just add it to the main comments list
      // In a full implementation, you'd want to update the nested structure
      setComments((prev) => [newComment, ...prev]);
    } else {
      // New top-level comment
      setComments((prev) => [newComment, ...prev]);
    }
    setShowCommentForm(false);
    setReplyToComment(null);
  };

  const handleReply = (parentId: string) => {
    setReplyToComment(parentId);
    setShowCommentForm(true);
  };

  return (
    <section className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-playfair text-gray-900 flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-teal-600" />
          Comments ({totalComments})
        </h2>
        
        {!showCommentForm && (
          <Button
            onClick={() => setShowCommentForm(true)}
            className="flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Add Comment
          </Button>
        )}
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <div className="mb-8">
          <CommentForm
            postSlug={postSlug}
            parentId={replyToComment || undefined}
            onSubmit={handleNewComment}
            onCancel={() => {
              setShowCommentForm(false);
              setReplyToComment(null);
            }}
          />
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postSlug={postSlug}
              onReply={handleReply}
              onNewComment={handleNewComment}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No comments yet</p>
          <p className="text-gray-400 text-sm">Be the first to share your thoughts!</p>
        </div>
      )}
    </section>
  );
}