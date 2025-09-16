/**
 * @fileOverview Supabase client and functions for a school results portal.
 * @note This file outlines a backend system using Supabase for a different application concept
 * (a results-checking portal with scratch cards) and is separate from the current Firebase-based
 * architecture of the Academiq personal productivity app.
 */

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = "https://YOUR_PROJECT_ID.supabase.co"
const supabaseKey = "YOUR_PUBLIC_ANON_KEY" // never expose service key
export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Student Login with Scratch Card
  */
  export async function loginWithScratchCard(scratchCard, session, term) {
    const { data, error } = await supabase
        .from("scratch_cards")
            .select("*")
                .eq("code", scratchCard)
                    .eq("is_used", false) // make sure it's fresh
                        .single()

                          if (error || !data) {
                              return { error: "Invalid or already used scratch card." }
                                }

                                  // fetch result for current session/term
                                    const { data: results, error: resultsError } = await supabase
                                        .from("results")
                                            .select("*")
                                                .eq("student_id", data.student_id)
                                                    .eq("session", session)
                                                        .eq("term", term)

                                                          if (resultsError) return { error: "Could not fetch results." }

                                                            return { student: data.student_id, results }
                                                            }

                                                            /**
                                                             * Teacher/Admin adds results
                                                              */
                                                              export async function addResult(studentId, session, term, subject, score) {
                                                                const { data, error } = await supabase
                                                                    .from("results")
                                                                        .insert([
                                                                              { student_id: studentId, session, term, subject, score }
                                                                                  ])

                                                                                    if (error) return { error: error.message }
                                                                                      return { success: true, data }
                                                                                      }
