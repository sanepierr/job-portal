import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import User from "../models/User.js";
import Company from "../models/Company.js";

// Controller for handling Clerk authentication webhooks

// Handle Clerk webhook events
export const handleWebhook = async (req, res) => {
    try {
        const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

        // Get webhook headers
        const headerPayload = req.headers;
        const svix_id = headerPayload["svix-id"];
        const svix_timestamp = headerPayload["svix-timestamp"];
        const svix_signature = headerPayload["svix-signature"];

        // If no webhook headers, return error
        if (!svix_id || !svix_timestamp || !svix_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing webhook headers"
            });
        }

        // Get webhook body
        const payload = req.body;
        const body = JSON.stringify(payload);

        // Create webhook instance
        const wh = new Webhook(WEBHOOK_SECRET);

        let evt;

        // Verify webhook signature
        try {
            evt = wh.verify(body, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            });
        } catch (err) {
            console.error('Error verifying webhook:', err);
            return res.status(400).json({
                success: false,
                message: "Error verifying webhook"
            });
        }

        // Handle different webhook event types
        const eventType = evt.type;

        switch (eventType) {
            case 'user.created':
                // Handle user creation
                const { id, email_addresses, first_name, last_name, image_url } = evt.data;

                // Create user in database
                await User.create({
                    clerkId: id,
                    email: email_addresses[0].email_address,
                    firstName: first_name,
                    lastName: last_name,
                    image: image_url
                });

                break;

            case 'user.updated':
                // Handle user update
                const { id: userId, email_addresses, first_name, last_name, image_url } = evt.data;

                // Update user in database
                await User.findOneAndUpdate(
                    { clerkId: userId },
                    {
                        email: email_addresses[0].email_address,
                        firstName: first_name,
                        lastName: last_name,
                        image: image_url
                    }
                );

                break;

            case 'user.deleted':
                // Handle user deletion
                const { id: deletedUserId } = evt.data;

                // Delete user from database
                await User.findOneAndDelete({ clerkId: deletedUserId });

                break;

            case 'organization.created':
                // Handle organization creation
                const { id: orgId, name, slug, image_url: orgImage } = evt.data;

                // Create company in database
                await Company.create({
                    clerkId: orgId,
                    name,
                    slug,
                    image: orgImage
                });

                break;

            case 'organization.updated':
                // Handle organization update
                const { id: updatedOrgId, name: orgName, slug: orgSlug, image_url: updatedOrgImage } = evt.data;

                // Update company in database
                await Company.findOneAndUpdate(
                    { clerkId: updatedOrgId },
                    {
                        name: orgName,
                        slug: orgSlug,
                        image: updatedOrgImage
                    }
                );

                break;

            case 'organization.deleted':
                // Handle organization deletion
                const { id: deletedOrgId } = evt.data;

                // Delete company from database
                await Company.findOneAndDelete({ clerkId: deletedOrgId });

                break;
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: "Webhook processed successfully"
        });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}